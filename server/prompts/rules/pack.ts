export const PACK_RULES = `
Pack rules:
- If product name contains "NUMBERxSIZEUNIT" (no spaces around x) e.g. "6X33C", "3X20CL", "4X25CL", "6X1L":
  → This is a multi-unit pack. Extract:
    pack.units:     the first number (e.g. 6)
    pack.volume:    size + unit lowercase (e.g. "33cl", "20cl", "1l")
    pack.unit_cost: round(item_total / pack.units, 2)
  → qty: 1 (one pack purchased)
  → unit_price: total price of the pack
  → keep the full original name including pack descriptor
- If no pack descriptor: pack: null`;
