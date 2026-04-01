import type { ParsedReceipt, SavedReceipt } from "~/types/receipt";

export const useReceiptHistory = () => {
  const history = useState<SavedReceipt[]>("receipt-history", () => []);

  const save = (receipt: ParsedReceipt) => {
    const entry: SavedReceipt = {
      ...receipt,
      id: crypto.randomUUID(),
      savedAt: new Date().toISOString(),
    };
    history.value.unshift(entry);
  };

  const remove = (id: string) => {
    history.value = history.value.filter((r) => r.id !== id);
  };

  const totalSpent = computed(() =>
    history.value.reduce((s, r) => s + r.total_paid, 0),
  );

  const totalSaved = computed(() =>
    history.value.reduce((s, r) => s + (r.total_savings ?? 0), 0),
  );

  return { history, save, remove, totalSpent, totalSaved };
};
