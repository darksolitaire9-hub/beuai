// app/composables/useReceiptHistory.ts | Composable | History context
// Manages in-memory receipt history and persists changes to IndexedDB.
// Hydrates from IndexedDB on first client mount; delegates storage to useReceiptStorage.
// Needs: useReceiptStorage, ParsedReceipt, SavedReceipt, deepClone

import type { SavedReceipt } from "../types/receipt";
import type { ParsedReceipt } from "../../parsing/types/receipt";

let _hydrated = false;

export const useReceiptHistory = () => {
  const history = useState<SavedReceipt[]>("receipt-history", () => []);
  const { loadAll, persist, drop } = useReceiptStorage();

  const hydrate = async (): Promise<void> => {
    if (!import.meta.client || _hydrated) return;
    _hydrated = true;
    const stored = await loadAll();
    history.value = stored.sort(
      (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime(),
    );
  };

  const save = async (receipt: ParsedReceipt): Promise<void> => {
    const plain = deepClone(toRaw(receipt));
    const entry: SavedReceipt = {
      ...plain,
      id: crypto.randomUUID(),
      savedAt: new Date().toISOString(),
    };
    await persist(entry);
    history.value.unshift(entry);
  };

  const remove = async (id: string): Promise<void> => {
    await drop(id);
    history.value = history.value.filter((r) => r.id !== id);
  };

  const totalSpent = computed(() =>
    history.value.reduce((s, r) => s + r.total_paid, 0),
  );

  const totalSaved = computed(() =>
    history.value.reduce((s, r) => s + (r.total_savings ?? 0), 0),
  );

  return { history, hydrate, save, remove, totalSpent, totalSaved };
};
