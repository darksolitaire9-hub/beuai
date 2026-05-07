// app/features/parsing/types/receipt.ts

export const DRIFT_TOLERANCE = 0.05;

export type ReceiptLineType = "single_unit" | "multi_pack" | "weighted";

export interface ReceiptItemPack {
  units: number;
  volume: string;
  unit_cost: number;
}

export interface ReceiptItem {
  name: string;
  category: string;
  line_type?: ReceiptLineType;
  qty: number;
  unit_price: number;
  discount: number;
  total: number;
  pack: ReceiptItemPack | null;
}

export interface ParsedReceipt {
  store: string;
  date: string;
  payment_method: string;
  subtotal: number;
  total_savings: number;
  total_paid: number;
  items: ReceiptItem[];
  _meta: {
    drift: number;
    trusted: boolean;
  };
}
