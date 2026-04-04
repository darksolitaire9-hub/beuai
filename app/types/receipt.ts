// =============================================================================
// bewai — Receipt Domain Types
// =============================================================================
//
// Ubiquitous language glossary: docs/domain-language.md
//
// Bounded context ownership:
//
//   Parsing context     — ParsedReceipt, ReceiptItem, ReceiptItemPack,
//                         drift, trusted, DRIFT_TOLERANCE
//   History context     — SavedReceipt, id, savedAt
//   Classification ctx  — category, name (raw line label)
//   Export/Analytics    — derived values, ReceiptLineType, ReceiptExportRow (planned)
//
// Semantic invariant on every ReceiptItem:
//   (qty * unit_price) - discount ≈ total
//   tolerance: Math.abs((qty * unit_price) - discount - total) <= DRIFT_TOLERANCE
//
// Derived values (compute on demand, never store separately):
//   gross_line_total = qty * unit_price
//   effective_units  = qty * pack.units      (multi_pack lines only)
//   gross_unit_cost  = unit_price / pack.units (multi_pack lines only)
//
// =============================================================================

// -----------------------------------------------------------------------------
// Drift Tolerance
// -----------------------------------------------------------------------------

/**
 * Maximum acceptable absolute difference (in euros) between the parser's
 * computed total and the printed total_paid on the receipt.
 *
 * Below this threshold → trusted = true.
 * At or above          → trusted = false, UI shows mismatch warning.
 *
 * Rationale: floating-point rounding across many line totals can introduce
 * small errors. 0.05 (5 cents) is intentionally conservative.
 */
export const DRIFT_TOLERANCE = 0.05;

// -----------------------------------------------------------------------------
// Receipt Line Type
// -----------------------------------------------------------------------------

/**
 * Describes how a receipt line is measured and priced.
 *
 *   single_unit  — one item, not a pack, priced per piece.
 *                  pack = null. qty is a whole number count.
 *                  e.g. one bread roll, one bottle of water.
 *
 *   multi_pack   — a pack of multiple units.
 *                  pack != null. qty is number of packs bought.
 *                  e.g. "COCA COLA LATA 6X33C" — 6 cans per pack.
 *
 *   weighted     — sold by weight.
 *                  pack = null. qty is weight in kg (may be fractional).
 *                  e.g. 0.350 kg of sliced meat at €/kg.
 *
 * This triad removes ambiguity in analytics and export derivations.
 * Use line_type to decide whether effective_units is meaningful.
 */
export type ReceiptLineType = "single_unit" | "multi_pack" | "weighted";

// -----------------------------------------------------------------------------
// Pack Info  (Parsing context + Analytics context)
// -----------------------------------------------------------------------------

/**
 * Describes the packaging structure for a receipt line sold as a multi-unit
 * pack (e.g. "6 × 33cl").
 *
 * Only present when line_type = "multi_pack".
 * null on single_unit and weighted lines.
 *
 * Value object — no identity of its own, fully defined by its fields.
 */
export interface ReceiptItemPack {
  /**
   * Number of individual units inside one pack.
   * e.g. 6 for "COCA COLA LATA 6X33C" (6 cans per pack).
   */
  units: number;

  /**
   * Size per individual unit, exactly as printed or inferred from the receipt.
   * e.g. "33cl", "20cl", "1L", "500ml".
   *
   * Kept as a label string — not normalized to ml — to preserve the receipt's
   * original wording and avoid introducing rounding errors during parsing.
   * Normalization (to ml) belongs to the Export/Analytics context.
   */
  volume: string;

  /**
   * Effective price per individual unit inside the pack, after discount (net).
   * Derived as: line_total / (qty * units).
   * e.g. 0.34 means each 33cl can effectively cost €0.34 after discount.
   */
  unit_cost: number;
}

// -----------------------------------------------------------------------------
// Receipt Item / Line  (Parsing context)
// -----------------------------------------------------------------------------

/**
 * One line on a parsed receipt — a single product row.
 *
 * Entity within its parent receipt (no standalone identity; identified by
 * position within the receipt).
 *
 * Bounded context: Parsing (primary), Classification (category + name).
 *
 * ─── Semantic contracts ───────────────────────────────────────────────────
 *
 *   qty        = number of packs/items as charged on the receipt.
 *                For multi_pack: number of packs (not individual units).
 *                For weighted:   weight in kg.
 *
 *   unit_price = gross price per pack/item before discount.
 *                For weighted:   price per kg.
 *
 *   discount   = absolute discount applied to this line (euros, >= 0).
 *
 *   total      = net amount paid for this line after discount.
 *
 * ─── Invariant ────────────────────────────────────────────────────────────
 *
 *   Math.abs((qty * unit_price) - discount - total) <= DRIFT_TOLERANCE
 *
 * ─── Derived values (compute, never store) ────────────────────────────────
 *
 *   gross_line_total = qty * unit_price
 *   effective_units  = qty * pack.units   (multi_pack only)
 *   gross_unit_cost  = unit_price / pack.units  (multi_pack only)
 */
export interface ReceiptItem {
  /**
   * Text printed on the receipt for this line by the store.
   * Raw OCR output — not normalized.
   * e.g. "ICE TEA LIPTON MANGA 6X33C", "PAO BIJOU".
   *
   * Use for: UI display, full-text search, future product normalization.
   * Do not treat as a stable product identifier — the same product may
   * appear with slightly different text across receipts or stores.
   */
  name: string;

  /**
   * Category assigned by our model for this item.
   * e.g. "BEBIDAS", "PADARIA/PASTELARIA", "LACTICINIOS".
   *
   * This is our classification — not the store's own taxonomy.
   * Currently a free string. Will become a controlled vocabulary value object
   * if a product normalization layer is introduced.
   *
   * Bounded context: Classification.
   */
  category: string;

  /**
   * Describes how this receipt line is measured and priced.
   * Drives analytics derivations (effective_units, gross_unit_cost).
   *
   *   single_unit → one piece, no pack, whole-number qty.
   *   multi_pack  → pack structure present, qty = packs bought.
   *   weighted    → qty = weight in kg, no pack.
   *
   * Optional for backward compatibility with receipts parsed before
   * this field was introduced. Defaults to "single_unit" when absent.
   */
  line_type?: ReceiptLineType;

  /**
   * How many packs or items of this line were purchased, as on the receipt.
   *
   * For multi_pack: number of packs bought (NOT number of units inside).
   *   e.g. qty=1 with pack.units=6 means 6 individual cans were bought.
   * For weighted: weight in kg (may be fractional).
   *   e.g. qty=0.350 means 350g.
   * For single_unit: whole-number count.
   */
  qty: number;

  /**
   * Price per pack or item as printed on the receipt, before discount (gross).
   * For weighted items: price per kg.
   * e.g. 2.55 means "€2.55 per pack" before any discount on this line.
   */
  unit_price: number;

  /**
   * Discount amount applied to this line (absolute value in euros).
   * 0 when no discount applies.
   * e.g. 0.51 means "€0.51 discounted on this line".
   *
   * Always absolute — never a percentage.
   */
  discount: number;

  /**
   * Final amount paid for this line after discount (net).
   * Ground truth for what was spent on this product on this trip.
   * e.g. 2.04 means "€2.04 paid for this line".
   */
  total: number;

  /**
   * Pack structure — present when line_type = "multi_pack".
   * null for single_unit and weighted lines.
   */
  pack: ReceiptItemPack | null;
}

// -----------------------------------------------------------------------------
// Parsed Receipt  (Parsing context — ephemeral, pre-save)
// -----------------------------------------------------------------------------

/**
 * A fully parsed receipt returned by the AI parsing layer.
 *
 * Bounded context: Parsing (primary).
 *
 * This is the live, ephemeral result in the app — not yet saved to history.
 * The user can review, then save (→ SavedReceipt) or discard.
 *
 * All amounts are in euros unless the receipt explicitly states otherwise.
 * Multi-currency support is reserved for a future iteration.
 */
export interface ParsedReceipt {
  /**
   * Store name as printed on the receipt.
   * e.g. "Pingo Doce", "Continente".
   *
   * Free text — not a stable store identifier. A normalized store_id
   * is reserved for future use in the Analytics context.
   */
  store: string;

  /**
   * Date of purchase, ISO 8601 format.
   * e.g. "2026-04-02".
   */
  date: string;

  /**
   * Payment method as parsed from the receipt.
   * e.g. "Multibanco", "Visa", "Cash".
   */
  payment_method: string;

  /**
   * Sum of all line totals before any store-wide discounts.
   * e.g. 16.56.
   */
  subtotal: number;

  /**
   * Total discount amount across all receipt lines.
   * Sum of individual line discounts.
   * e.g. 1.53.
   */
  total_savings: number;

  /**
   * Final amount paid as printed on the receipt.
   * Ground truth: the amount charged at the register.
   */
  total_paid: number;

  /**
   * All product lines parsed from the receipt, in receipt order.
   */
  items: ReceiptItem[];

  /**
   * Parser metadata — internal validation only, not for display.
   *
   *   drift   — absolute difference between the parser's computed total
   *             (sum of line totals) and the printed total_paid.
   *             |sum(items[i].total) - total_paid|.
   *             0 is ideal. >= DRIFT_TOLERANCE triggers trusted = false.
   *
   *   trusted — true when drift < DRIFT_TOLERANCE (currently 0.05).
   *             false triggers the "Total mismatch detected" warning in the UI.
   */
  _meta: {
    drift: number;
    trusted: boolean;
  };
}

// -----------------------------------------------------------------------------
// Saved Receipt  (History context — immutable snapshot)
// -----------------------------------------------------------------------------

/**
 * A receipt saved to history by the user.
 *
 * Bounded context: History.
 *
 * Extends ParsedReceipt with a stable identity and a save timestamp.
 * This is the source of truth for history, exports, and analytics.
 *
 * IMMUTABILITY CONTRACT:
 *   Never mutate a SavedReceipt after it is stored.
 *   It is a snapshot of what the parser produced at the time
 *   the user reviewed and confirmed the result.
 *   If re-parsing is ever needed, create a new SavedReceipt.
 *
 * Domain events (reserved for future implementation):
 *   ReceiptSaved    — emitted when this record is first persisted.
 *   ReceiptExported — emitted when this receipt is included in a CSV export.
 */
export interface SavedReceipt extends ParsedReceipt {
  /**
   * Unique identifier for this saved receipt.
   * Generated at save time using crypto.randomUUID().
   * Stable across all contexts — used as a foreign key in export rows.
   */
  id: string;

  /**
   * ISO 8601 timestamp of when the user saved this receipt.
   * e.g. "2026-04-03T20:30:00.000Z".
   *
   * Distinct from receipt date (the purchase date).
   * Used for ordering history and tracking saving patterns.
   */
  savedAt: string;
}

// -----------------------------------------------------------------------------
// Export Row  (Export/Analytics context — planned)
// -----------------------------------------------------------------------------

/**
 * A flat row representing one receipt line for CSV export and analytics.
 *
 * Bounded context: Export/Analytics.
 *
 * Derived from SavedReceipt at export time — never stored separately.
 * One ReceiptExportRow per ReceiptItem per SavedReceipt.
 *
 * Domain event: ReceiptExported (reserved).
 *
 * @planned — not yet implemented. Shape defined here to anchor the
 * export contract against future implementation.
 */
export interface ReceiptExportRow {
  // ── Receipt identity ──────────────────────────────────────────────────────
  receipt_id: string;
  saved_at: string;
  store: string;
  receipt_date: string;
  payment_method: string;

  // ── Line identity ─────────────────────────────────────────────────────────
  line_index: number;       // 0-based position on the receipt
  line_type: ReceiptLineType;
  item_name: string;        // raw label as printed
  category: string;

  // ── Quantities ────────────────────────────────────────────────────────────
  qty: number;              // packs/items/kg as on receipt
  pack_units: number | null;
  pack_volume: string | null;
  effective_units: number | null;  // qty * pack_units (multi_pack only)

  // ── Prices ────────────────────────────────────────────────────────────────
  unit_price: number;       // gross per pack/item/kg
  gross_line_total: number; // qty * unit_price
  discount_amount: number;
  line_total: number;       // net paid
  price_per_unit: number | null;  // pack.unit_cost (multi_pack only)

  // ── Receipt totals (denormalized for flat export) ─────────────────────────
  receipt_subtotal: number;
  receipt_total_savings: number;
  receipt_total_paid: number;
}