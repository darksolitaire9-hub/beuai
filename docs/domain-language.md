# bewai — Domain Language

> This is the project's ubiquitous language document.  
> When naming a variable, interface, function, or UI label — consult this first.  
> When concepts evolve — update this document before updating the code.

***

## Why This Exists

Receipt data serves at least three audiences simultaneously:

- **The app** — renders it correctly in UI components.
- **The analyst** — exports clean, unambiguous fields for CSV and analysis.
- **The developer** — reads and maintains the code without decoding jargon.

A shared domain language ensures the same word means the same thing
everywhere: in code, in comments, in CSV headers, and in team conversations.
This is the principle of a *ubiquitous language* in Domain-Driven Design.

***

## DDD Review Status

This document reflects the following DDD review findings (April 2026):

- ✅ Bounded context ownership made explicit
- ✅ Entity vs value object distinctions documented
- ✅ Invariants with explicit tolerance rules
- ✅ Pack type triad (SingleUnit / MultiPack / Weighted)
- ✅ Domain events reserved with names
- ✅ Category future evolution noted
- ✅ Store identity reserved
- ✅ Derived values table with formulas

***

## Bounded Contexts

The domain is divided into four bounded contexts.
Each concept belongs to exactly one owning context.

| Concept | Owning Context | Notes |
|---|---|---|
| `ParsedReceipt` | **Parsing** | Ephemeral; produced by AI layer |
| `ReceiptItem` | **Parsing** | One product row per receipt |
| `ReceiptItemPack` | **Parsing** | Multi-unit packaging structure |
| `drift`, `trusted` | **Parsing** | Validation metadata |
| `DRIFT_TOLERANCE` | **Parsing** | Business rule constant |
| `category` | **Classification** | Our model's label, not the store's |
| `name` (line label) | **Classification** | Raw text from store |
| `SavedReceipt` | **History** | Immutable snapshot |
| `id`, `savedAt` | **History** | Identity and timestamp |
| `ReceiptLineType` | **Export / Analytics** | Line measurement type |
| `ReceiptExportRow` | **Export / Analytics** | Flat row for CSV |
| Derived values | **Export / Analytics** | Computed at export time |

***

## Core Concepts

### Receipt

A single bill from a store, as captured by the user (via camera or file upload)
and parsed by the AI layer.

A receipt has:
- a header (store, date, payment, totals)
- one or more receipt lines (products)
- parser metadata (drift, trusted flag)

A receipt moves through states — see State Transitions below.

***

### Receipt Line

One product row on the receipt. What the store printed for a single product.

In code: `ReceiptItem`.

A receipt line has:
- a line label (exactly what the store printed)
- a category (our classification)
- a line type (how it is measured)
- a quantity, price, discount, and line total
- optionally, pack information

***

### Line Label

The text printed by the store for a receipt line.

In code: `name` on `ReceiptItem`.

This is raw, unmodified OCR output — not normalized or corrected.
Examples: `"ICE TEA LIPTON MANGA 6X33C"`, `"PAO BIJOU"`, `"COCA COLA LATA 6X33C"`.

Use for: UI display, full-text search, and future product normalization.

Do not treat as a stable product identifier. The same product may appear with
slightly different text across receipts, stores, or receipt formats.

***

### Category

The category we assign to a receipt line for grouping and analysis.

In code: `category` on `ReceiptItem`.

This is **our classification** — not the store's own taxonomy.
Examples: `"BEBIDAS"`, `"PADARIA/PASTELARIA"`, `"LACTICINIOS"`.

Used for: grouping items in the UI, category-level spending analysis.

> **Future evolution**: Category is currently a plain string (free label).  
> If a controlled product taxonomy is introduced (product normalization phase),  
> Category will become a **value object with a fixed controlled vocabulary**,  
> not a free string. The field name will remain `category`.

***

### Receipt Line Type

Describes how a receipt line is measured and priced.

In code: `ReceiptLineType` on `ReceiptItem.line_type`.

Three possible types — the triad that covers all receipt line patterns:

| Type | Meaning | qty represents | pack |
|---|---|---|---|
| `single_unit` | One item, priced per piece | Count (whole number) | null |
| `multi_pack` | Pack of multiple units | Number of packs bought | present |
| `weighted` | Sold by weight | Weight in kg (may be fractional) | null |

Examples:
- `PAO BIJOU` → `single_unit` (one bread roll, qty=4 means 4 rolls)
- `COCA COLA LATA 6X33C` → `multi_pack` (pack of 6, qty=1 means 1 pack)
- `FRANGO ASSADO 0.450KG` → `weighted` (qty=0.450 means 450g)

Use `line_type` to decide which derived values are meaningful:
- `effective_units` is only valid for `multi_pack`.
- `gross_unit_cost` is only valid for `multi_pack`.
- Weight-adjusted cost analysis applies only to `weighted`.

***

### Quantity

How many packs, items, or kilograms of a receipt line were purchased,
as shown on the receipt.

In code: `qty` on `ReceiptItem`.

Semantic rules by line type:
- `multi_pack` → number of packs bought, NOT number of individual units.
  Example: qty=1 with pack.units=6 means 6 cans were purchased.
- `weighted`   → weight in kg. Example: qty=0.350 means 350g.
- `single_unit` → whole-number count of individual items.

***

### Price Per Item

The gross price for one pack, item, or kg as printed on the receipt,
**before any discount** is applied.

In code: `unit_price` on `ReceiptItem`.

For `multi_pack`: price per pack (not per individual unit inside the pack).
For `weighted`: price per kg.

***

### Discount Amount

The absolute euro value discounted on a receipt line.

In code: `discount` on `ReceiptItem`.

Always an absolute value (euros), never a percentage.
Zero when no discount applies to this line.

***

### Line Total

The final amount paid for a receipt line after discount. Net.

In code: `total` on `ReceiptItem`.

Ground truth for what was spent on this product on this shopping trip.

***

### Pack

Describes the multi-unit packaging of a product when it is sold as a pack.

In code: `ReceiptItemPack` on `ReceiptItem.pack`.

Value object — no identity of its own. Fully described by its three fields.

Present only when `line_type = "multi_pack"`.
Null for `single_unit` and `weighted` lines.

***

### Units Per Pack

The number of individual units inside one pack.

In code: `units` on `ReceiptItemPack`.

Example: 6 for "COCA COLA LATA 6X33C" (a pack of 6 cans).

***

### Unit Size Label

The human-readable size per individual unit, as printed or inferred.

In code: `volume` on `ReceiptItemPack`.

Examples: `"33cl"`, `"20cl"`, `"1L"`, `"500ml"`.

Kept as a label string — not normalized to ml — to preserve the receipt's
original wording. Normalization to ml belongs to the Export/Analytics context
if needed.

***

### Price Per Unit

The effective price per individual unit inside the pack, after discount (net).

In code: `unit_cost` on `ReceiptItemPack`.

Derived from: `line_total / (qty * units_per_pack)`.

Example: 0.34 means each 33cl can effectively cost €0.34 after discount.

***

### Drift

The absolute difference between the total our parser computed by summing
line totals and the `total_paid` printed on the receipt.

In code: `_meta.drift` on `ParsedReceipt`.

Formula: `|sum(items[i].total) - total_paid|`

Zero is ideal. A non-zero drift means the parser's understanding of the
receipt does not perfectly match the actual bill.

***

### Drift Tolerance

The maximum acceptable drift before a receipt is considered untrustworthy.

In code: `DRIFT_TOLERANCE` constant (currently `0.05`).

**Tolerance rule:**
- `drift < 0.05` (5 cents) → `trusted = true`
- `drift >= 0.05`          → `trusted = false`

Rationale: floating-point rounding across many line totals can introduce
small errors of 1–2 cents. 5 cents is intentionally conservative to catch
real parsing errors without false positives.

**Note on tolerance type:** this is an **absolute** euro tolerance, not a
relative percentage. For receipts above ~€50, a relative tolerance may be
more appropriate in a future iteration.

***

### Trusted

A boolean indicating whether the parser's result is within drift tolerance.

In code: `_meta.trusted` on `ParsedReceipt`.

| Value | Meaning | UI behaviour |
|---|---|---|
| `true` | drift < DRIFT_TOLERANCE | No warning shown |
| `false` | drift >= DRIFT_TOLERANCE | "Total mismatch detected" warning shown |

***

## Derived Values (Compute, Never Store)

These are not stored in any type. Compute them when needed in formatters,
export mappers, or analytics functions.

| Name | Formula | Applies to |
|---|---|---|
| `gross_line_total` | `qty * unit_price` | All lines |
| `effective_units` | `qty * pack.units` | `multi_pack` only |
| `gross_unit_cost` | `unit_price / pack.units` | `multi_pack` only |
| `net_unit_cost` | `total / (qty * pack.units)` | `multi_pack` only (= pack.unit_cost) |

***

## Invariants

These rules must hold for every valid `ReceiptItem`.
A parser or import that violates these should be flagged and rejected.

**Line invariant:**
```
Math.abs((qty * unit_price) - discount - total) <= DRIFT_TOLERANCE
```

**Receipt invariant:**
```
Math.abs(sum(items[i].total) - total_paid) = drift
drift < DRIFT_TOLERANCE → trusted = true
```

***

## State Transitions

```
scan / upload
     |
     v
[ParsedReceipt]   — ephemeral, lives in app state only
     |                   user reviews
     |
  ┌──┴──────────────────┐
  │ save                │ discard
  v                     v
[SavedReceipt]       (cleared)
  — immutable
  — persisted to IndexedDB (planned)
  — source of truth for history + export
     |
  export (planned)
     |
     v
[ReceiptExportRow[]]   — one flat row per ReceiptItem, derived on demand
```

***

## Entities and Value Objects

### Entities (have identity)

| Name | Identity | Owned by |
|---|---|---|
| `SavedReceipt` | `id` (UUID) | History context |
| `ReceiptItem` | position within receipt | Parsing context |

### Value Objects (no identity, defined by values)

| Name | Owned by |
|---|---|
| `ReceiptItemPack` | Parsing context |
| `ReceiptLineType` | Export / Analytics context |
| `drift` | Parsing context |
| `category` (current string form) | Classification context |

***

## Domain Events (Reserved)

These events are not yet implemented but are named here to anchor
the language for a future event-driven or audit layer.

| Event | Triggered when |
|---|---|
| `ReceiptParsed` | AI layer returns a parsed result to the app |
| `ReceiptSaved` | User confirms and saves a receipt to history |
| `ReceiptDiscarded` | User discards a parsed receipt without saving |
| `ReceiptExported` | A CSV export is generated from saved receipts |

***

## Reserved Terms (Future Use)

These concepts do not yet exist in the codebase but are reserved to avoid
naming conflicts as the domain grows.

| Term | Purpose |
|---|---|
| `store_id` | Stable normalized identifier for a store (e.g. "pingo-doce"). Needed for multi-store analytics. `store` (free text) will remain as the display label. |
| `CanonicalProduct` | Future entity for normalized product identity across receipts and stores. Will map from `ReceiptItem.name` (raw label). |
| `MonetaryAmount` | Future value object pairing a numeric value with a currency code, for multi-currency support. |
| `store_category` | The store's own category taxonomy, distinct from our `category`. |

***

## Export Shape

When CSV export is implemented, each `SavedReceipt` produces one flat row
per `ReceiptItem`. Export rows are derived at export time — never stored.

Planned CSV columns, in order:

| Column | Source | Notes |
|---|---|---|
| `receipt_id` | `SavedReceipt.id` | |
| `saved_at` | `SavedReceipt.savedAt` | |
| `store` | `SavedReceipt.store` | |
| `receipt_date` | `SavedReceipt.date` | |
| `payment_method` | `SavedReceipt.payment_method` | |
| `line_index` | item position | 0-based |
| `line_type` | `ReceiptItem.line_type` | |
| `item_name` | `ReceiptItem.name` | raw label |
| `category` | `ReceiptItem.category` | |
| `qty` | `ReceiptItem.qty` | |
| `unit_price` | `ReceiptItem.unit_price` | gross |
| `gross_line_total` | `qty * unit_price` | derived |
| `discount_amount` | `ReceiptItem.discount` | |
| `line_total` | `ReceiptItem.total` | net paid |
| `pack_units` | `pack.units` or empty | |
| `pack_volume` | `pack.volume` or empty | |
| `price_per_unit` | `pack.unit_cost` or empty | |
| `effective_units` | `qty * pack.units` or empty | |
| `receipt_subtotal` | `SavedReceipt.subtotal` | denormalized |
| `receipt_total_savings` | `SavedReceipt.total_savings` | denormalized |
| `receipt_total_paid` | `SavedReceipt.total_paid` | denormalized |

***

## What This Language Is Not

- **Not the store's language.** Stores use their own category names and product codes.
  We do not inherit their taxonomy. `category` is always our classification.
- **Not database column names.** These are semantic concepts first.
  Code and column names should reflect them but may differ for platform reasons.
- **Not final.** As the domain grows, this document must be updated
  *before* the code changes.

***

## Document Maintenance

When to update this document:
- A new domain concept is introduced.
- An existing concept changes meaning.
- A reserved term is promoted to an implemented concept.
- A bounded context boundary changes.

When not to update:
- Pure implementation changes (new composable, new component) that do not
  introduce new domain concepts.

***

*Last reviewed: 2026-04-04 (DDD review pass applied)*  
*Maintainer: bewai project*