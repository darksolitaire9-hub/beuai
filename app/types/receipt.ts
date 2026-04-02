export interface ReceiptItemPack {
  units: number; // how many units in the pack (e.g. 6)
  volume: string; // volume/size per unit (e.g. "33cl", "20cl", "1L")
  unit_cost: number; // price per individual unit (total / units)
}

export interface ReceiptItem {
  name: string;
  category: string;
  qty: number; // packs purchased
  unit_price: number; // price per pack
  total: number;
  discount: number;
  pack: ReceiptItemPack | null; // null if not a pack item
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
