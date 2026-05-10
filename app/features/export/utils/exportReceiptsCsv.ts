// app/utils/exportReceiptsCsv.ts | Utility | Export / Analytics context
// Pure functions to map SavedReceipt[] to CSV rows and serialise to a string.
// downloadCsv is the only impure function — it is isolated here deliberately.
// Needs: SavedReceipt, ReceiptExportRow from ~/types/receipt

import type { SavedReceipt } from "../../history/types/receipt";
import type { ReceiptExportRow } from "../types/receipt";

const CSV_SEPARATOR = ",";

export function mapToRows(receipts: SavedReceipt[]): ReceiptExportRow[] {
  const rows: ReceiptExportRow[] = [];

  for (const receipt of receipts) {
    receipt.items.forEach((item, index) => {
      const packUnits = item.pack?.units ?? null;
      const packVolume = item.pack?.volume ?? null;
      const effectiveUnits =
        item.line_type === "multi_pack" && packUnits != null
          ? item.qty * packUnits
          : null;

      rows.push({
        receipt_id: receipt.id,
        saved_at: receipt.savedAt,
        store: receipt.store,
        vendor_tax_id: receipt.vendor_tax_id,
        customer_tax_id: receipt.customer_tax_id,
        receipt_date: receipt.date,
        invoice_number: receipt.invoice_number,
        payment_method: receipt.payment_method,

        line_index: index,
        line_type: item.line_type ?? "single_unit",
        item_name: item.name,
        category: item.category,

        qty: item.qty,
        pack_units: packUnits,
        pack_volume: packVolume,
        effective_units: effectiveUnits,

        unit_price: item.unit_price,
        tax_rate: item.tax_rate,
        gross_line_total: item.qty * item.unit_price,
        discount_amount: item.discount,
        line_total: item.total,
        price_per_unit: item.pack?.unit_cost ?? null,

        receipt_subtotal: receipt.subtotal,
        receipt_tax_total: receipt.tax_total,
        receipt_total_paid: receipt.total_paid,
      });
    });
  }

  return rows;
}

function escapeCsv(value: unknown): string {
  if (value == null) return "";
  const str = String(value);
  return str.includes('"') || str.includes(",") || str.includes("\n")
    ? `"${str.replace(/"/g, '""')}"`
    : str;
}

export function buildReceiptsCsv(receipts: SavedReceipt[]): string {
  const rows = mapToRows(receipts);
  if (rows.length === 0) return "";

  const headers = Object.keys(
    rows[0] as ReceiptExportRow,
  ) as (keyof ReceiptExportRow)[];

  const lines: string[] = [];
  lines.push(headers.join(CSV_SEPARATOR));

  for (const row of rows) {
    if (!row) continue; // defensive, satisfies TS even though mapToRows never pushes undefined
    const line = headers.map((key) => escapeCsv(row[key])).join(CSV_SEPARATOR);
    lines.push(line);
  }

  return lines.join("\n");
}
// Impure — browser side effect, isolated deliberately
export function downloadCsv(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
