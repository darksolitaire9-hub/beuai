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
  tax_rate: number | null;
  discount: number;
  total: number;
  pack: ReceiptItemPack | null;
}

export interface ParsedReceipt {
  store: string;
  vendor_tax_id: string | null;
  customer_tax_id: string | null;
  date: string;
  invoice_number: string | null;
  payment_method: string;
  subtotal: number;
  tax_total: number;
  total_savings: number;
  total_paid: number;
  items: ReceiptItem[];
  _meta: {
    drift: number;
    trusted: boolean;
  };
}

export const RECEIPT_CATEGORIES = [
  "supermarket",
  "utilities",
  "restaurant",
  "office_supplies",
  "fuel",
  "other",
] as const;

export type ReceiptCategory = (typeof RECEIPT_CATEGORIES)[number];
