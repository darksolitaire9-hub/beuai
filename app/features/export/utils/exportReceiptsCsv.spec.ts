import { describe, it, expect } from "vitest";
import { mapToRows, buildReceiptsCsv } from "./exportReceiptsCsv";
import type { SavedReceipt } from "../../history/types/receipt";

describe("exportReceiptsCsv", () => {
  const mockReceipts: SavedReceipt[] = [
    {
      id: "1",
      savedAt: "2026-04-03T20:30:00.000Z",
      store: "Pingo Doce",
      vendor_tax_id: "123456789",
      customer_tax_id: "987654321",
      date: "2026-04-02",
      invoice_number: "FT 123",
      payment_method: "Multibanco",
      subtotal: 10,
      tax_total: 2,
      total_paid: 12,
      items: [
        {
          name: "Item 1",
          category: "supermarket",
          qty: 1,
          unit_price: 5,
          tax_rate: 23,
          discount: 1,
          total: 4,
          line_type: "single_unit",
          pack: null,
        },
      ],
      signature: "mock-sig",
      _meta: { drift: 0, trusted: true },
    },
  ];

  describe("mapToRows", () => {
    it("should correctly map a SavedReceipt to flat rows", () => {
      const rows = mapToRows(mockReceipts);
      expect(rows).toHaveLength(1);

      expect(rows[0]).toMatchObject({
        receipt_id: "1",
        item_name: "Item 1",
        vendor_tax_id: "123456789",
        receipt_tax_total: 2,
        tax_rate: 23,
      });
    });
  });

  describe("buildReceiptsCsv", () => {
    it("should return empty string for empty input", () => {
      expect(buildReceiptsCsv([])).toBe("");
    });

    it("should generate a CSV string with headers", () => {
      const csv = buildReceiptsCsv(mockReceipts);
      const lines = csv.split("\n");

      expect(lines[0]).toContain("receipt_id,saved_at,store");
      expect(lines[1]).toContain("1,2026-04-03T20:30:00.000Z,Pingo Doce");
    });
  });
});
