// server/prompts/rules/not-receipt.ts | Constants | Parsing context
// Shared instructions for detecting non-receipt images across all language prompts.

export const NOT_RECEIPT_RULE = `
Detection rule (non-negotiable contract):

You are extracting data ONLY from shopping receipts.

Before generating JSON, follow this checklist:

1) Look at the image and decide:
   - Is it clearly a shopping receipt with line items?
   - Or is it something else (selfie, person, random object, landscape,
     generic document, invoice without per-item lines, blank page, screenshot)?

2) If it is NOT clearly a shopping receipt:
   - You MUST set: not_receipt: true
   - You MUST set ALL other fields to these exact empty defaults:
     - store: ""
     - date: ""
     - payment_method: ""
     - receipt_subtotal: 0
     - receipt_total_savings: 0
     - receipt_total_paid: 0
     - items: []
   - You MUST NOT guess or invent any items, totals, discounts, store names,
     or dates.
   - Then STOP. Do not try to infer receipt content from non-receipt images.

3) Only if it IS clearly a shopping receipt with line items:
   - You MUST set: not_receipt: false
   - You MUST fill all other fields according to the receipt parsing rules
     and BASE_SCHEMA.

If you are uncertain whether the image is a receipt, you MUST treat it as
not a receipt and follow step 2.
`;
