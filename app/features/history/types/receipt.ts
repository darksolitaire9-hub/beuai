// app/features/history/types/receipt.ts
import type { ParsedReceipt } from "../../parsing/types/receipt";

export interface SavedReceipt extends ParsedReceipt {
  id: string;
  savedAt: string;
}
