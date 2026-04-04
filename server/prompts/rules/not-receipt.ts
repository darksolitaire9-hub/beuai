// server/prompts/rules/not-receipt.ts | Constants | Parsing context
// Shared instructions for detecting non-receipt images across all language prompts.

export const NOT_RECEIPT_RULE = `
Detection rule:
- If the image is clearly NOT a shopping receipt (e.g. a photo, random document,
  invoice without per-item lines, blank page, screenshot):
  → not_receipt: true
  → all other fields as empty defaults:
    store: "", date: "", payment_method: "",
    subtotal: 0, total_savings: 0, total_paid: 0, items: []
  → do NOT hallucinate receipt data
- If the image IS a shopping receipt:
  → not_receipt: false
  → fill all fields according to the rules below
`;
