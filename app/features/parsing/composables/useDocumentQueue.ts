// app/features/parsing/composables/useDocumentQueue.ts
import { markRaw } from "vue";
import type { ParsedReceipt } from "../types/receipt";

export type QueueItemStatus = "pending" | "compressing" | "analyzing" | "review_needed" | "done" | "failed" | "duplicate";

export interface QueueItem {
  id: string;
  file: File;
  status: QueueItemStatus;
  result: ParsedReceipt | null;
  error?: string;
  retries?: number;
}

const MAX_CONCURRENCY = 2;
const MAX_RETRIES = 2;

export const useDocumentQueue = () => {
  const queue = useState<QueueItem[]>("document-queue", () => []);
  const processingCount = computed(() => queue.value.filter(item => ["compressing", "analyzing"].includes(item.status)).length);
  const isProcessing = computed(() => processingCount.value > 0);
  
  const { scan } = useReceiptScanner();
  const { loadQueue, persistQueueItem, dropQueueItem } = useReceiptStorage();

  const hydrate = async () => {
    if (!import.meta.client) return;
    const stored = await loadQueue();
    // Items loaded from DB are already in review_needed or failed state
    queue.value = stored;
  };

  const addFiles = async (files: File[]) => {
    const newItems = files.map(file => ({
      id: crypto.randomUUID(),
      // CRITICAL: markRaw prevents Vue from proxying the File object, avoiding DataCloneError
      file: markRaw(file),
      status: "pending" as QueueItemStatus,
      result: null,
      retries: 0,
    }));
    queue.value.push(...newItems);
    // Note: We do NOT persist 'pending' items to IDB to avoid saving heavy raw files
    processNext();
  };

  const processNext = async () => {
    if (processingCount.value >= MAX_CONCURRENCY) return;

    const next = queue.value.find(item => item.status === "pending");
    if (!next) return;

    try {
      next.status = "compressing";
      
      const { scan: scanSingle } = useReceiptScanner();
      await scanSingle(next.file);
      
      const { result: scanResult } = useReceiptScanner();
      
      if (scanResult.value) {
        next.result = JSON.parse(JSON.stringify(scanResult.value));
        next.status = "review_needed";
        // Persist to IDB only now that we have lightweight result data
        await persistQueueItem(next);
      }
    } catch (err: any) {
      const statusCode = err.statusCode || err.status;
      const isRetryable = [429, 502, 503].includes(statusCode);

      if (isRetryable && (next.retries || 0) < MAX_RETRIES) {
        next.status = "pending";
        next.retries = (next.retries || 0) + 1;
        // Wait 2s before allowing retry
        setTimeout(processNext, 2000);
      } else {
        next.status = "failed";
        next.error = err.data?.message || err.message;
        await persistQueueItem(next);
      }
    }

    // Attempt to start next item if capacity allows
    processNext();
  };

  const remove = async (id: string) => {
    queue.value = queue.value.filter(item => item.id !== id);
    await dropQueueItem(id);
  };

  const clearDone = async () => {
    const toRemove = queue.value.filter(item => ["done", "duplicate"].includes(item.status));
    queue.value = queue.value.filter(item => !["done", "duplicate"].includes(item.status));
    for (const item of toRemove) {
      await dropQueueItem(item.id);
    }
  };

  return { queue, processing: isProcessing, addFiles, processNext, remove, clearDone, hydrate };
};
