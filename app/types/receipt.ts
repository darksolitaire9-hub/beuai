export interface ReceiptItem {
  name: string;
  category: string;
  qty: number;
  unit_price: number;
  total: number;
  discount: number;
}

export interface ParsedReceipt {
  store: string;
  date: string;
  payment_method: string;
  subtotal: number;
  total_savings: number;
  total_paid: number;
  items: ReceiptItem[];
  _meta: { drift: number; trusted: boolean };
}

export interface SavedReceipt extends ParsedReceipt {
  id: string;
  savedAt: string;
}
