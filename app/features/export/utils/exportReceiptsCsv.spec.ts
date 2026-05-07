import { describe, it, expect } from "vitest";
import { mapToRows, buildReceiptsCsv } from "./exportReceiptsCsv";
import type { SavedReceipt } from "../../history/types/receipt";

describe("exportReceiptsCsv", () => {
  const mockReceipts: SavedReceipt[] = [
    {
      id: "1",
      savedAt: "2026-04-03T20:30:00.000Z",
      store: "Pingo Doce",
      date: "2026-04-02",
      payment_method: "Multibanco",
      subtotal: 10,
      total_savings: 2,
      total_paid: 8,
      items: [
        {
          name: "Item 1",
          category: "Groceries",
          qty: 1,
          unit_price: 5,
          discount: 1,
          total: 4,
          line_type: "single_unit",
          pack: null,
        },
        {
          name: 'Item "Special"',
          category: "Other",
          qty: 2,
          unit_price: 3,
          discount: 1,
          total: 5,
          line_type: "multi_pack",
          pack: {
            units: 6,
            volume: "33cl",
            unit_cost: 0.5,
          },
        },
      ],
      _meta: { drift: 0, trusted: true },
    },
  ];

  describe("mapToRows", () => {
    it("should correctly map a SavedReceipt to flat rows", () => {
      const rows = mapToRows(mockReceipts);
      expect(rows).toHaveLength(2);

      expect(rows[0]).toMatchObject({
        receipt_id: "1",
        item_name: "Item 1",
        qty: 1,
        line_total: 4,
        effective_units: null,
      });

      expect(rows[1]).toMatchObject({
        receipt_id: "1",
        item_name: 'Item "Special"',
        qty: 2,
        line_total: 5,
        effective_units: 12, // 2 * 6
        pack_units: 6,
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
      // Check escaping for the item with quotes
      expect(lines[2]).toContain('"Item ""Special"""');
    });
  });
});
