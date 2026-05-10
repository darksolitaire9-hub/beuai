// app/features/parsing/composables/useDocumentQueue.ts
import type { ParsedReceipt } from "../types/receipt";

export type QueueItemStatus = "pending" | "compressing" | "analyzing" | "review_needed" | "done" | "failed" | "duplicate";

export interface QueueItem {
  id: string;
  file: File;
  status: QueueItemStatus;
  result: ParsedReceipt | null;
  error?: string;
}

export const useDocumentQueue = () => {
  const queue = useState<QueueItem[]>("document-queue", () => []);
  const processing = computed(() => queue.value.some(item => ["compressing", "analyzing"].includes(item.status)));
  
  const { scan } = useReceiptScanner(); // We will reuse the scanner logic for individual items
  const { isDuplicate } = useReceiptStorage();

  const addFiles = (files: File[]) => {
    const newItems = files.map(file => ({
      id: crypto.randomUUID(),
      file,
      status: "pending" as QueueItemStatus,
      result: null,
    }));
    queue.value.push(...newItems);
  };

  const processNext = async () => {
    const next = queue.value.find(item => item.status === "pending");
    if (!next) return;

    try {
      next.status = "compressing";
      // Temporary: we hijack useReceiptScanner's logic but handle the state here
      // In a real refactor, useReceiptScanner would be lower level
      const { scan: scanSingle } = useReceiptScanner();
      
      await scanSingle(next.file);
      
      // The scanner updates its internal result, we grab it
      const { result: scanResult } = useReceiptScanner();
      
      if (scanResult.value) {
        next.result = JSON.parse(JSON.stringify(scanResult.value));
        next.status = "review_needed";
      }
    } catch (err: any) {
      next.status = "failed";
      next.error = err.message;
    }

    // Recurse to process the next pending item
    await processNext();
  };

  const remove = (id: string) => {
    queue.value = queue.value.filter(item => item.id !== id);
  };

  const clearDone = () => {
    queue.value = queue.value.filter(item => !["done", "duplicate"].includes(item.status));
  };

  return { queue, processing, addFiles, processNext, remove, clearDone };
};
