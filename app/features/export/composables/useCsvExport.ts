// app/features/export/composables/useCsvExport.ts
import type { SavedReceipt } from "../../history/types/receipt";

export const useCsvExport = () => {
  const exportAll = (history: SavedReceipt[]) => {
    if (!history.length) return false;

    const csv = buildReceiptsCsv(history);
    const filename = `beuai-receipts-${new Date().toISOString().slice(0, 10)}.csv`;
    downloadCsv(csv, filename);
    return true;
  };

  return { exportAll };
};
