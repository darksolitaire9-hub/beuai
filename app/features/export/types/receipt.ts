// app/features/export/types/receipt.ts
import type { ReceiptLineType } from "../../parsing/types/receipt";

export interface ReceiptExportRow {
  receipt_id: string;
  saved_at: string;
  store: string;
  vendor_tax_id: string | null;
  customer_tax_id: string | null;
  receipt_date: string;
  invoice_number: string | null;
  payment_method: string;

  line_index: number;
  line_type: ReceiptLineType;
  item_name: string;
  category: string;

  qty: number;
  pack_units: number | null;
  pack_volume: string | null;
  effective_units: number | null;

  unit_price: number;
  tax_rate: number | null;
  gross_line_total: number;
  discount_amount: number;
  line_total: number;
  price_per_unit: number | null;

  receipt_subtotal: number;
  receipt_tax_total: number;
  receipt_total_paid: number;
}
