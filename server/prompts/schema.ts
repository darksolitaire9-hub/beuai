// server/prompts/schema.ts | Constants | Parsing context
// JSON schema string injected at the end of every language prompt.
// not_receipt is an internal signal stripped on the server before returning to the client.

export const BASE_SCHEMA = `
<context>
You are a multi-regional financial analyst. 
Extract data into a UNIFIED schema. Map local regional terms to our global fields:
- "Tax ID" (Global) <- NIF (PT/ES), VAT No (UK), CIF (ES), GSTIN (IN)
- "Tax Total" (Global) <- IVA (PT/ES), VAT (UK), Tax (US/EN)
- "Tax Rate" (Global) <- % IVA, % VAT, % Tax
Ignore handwritten calculations. Prioritize printed totals.
</context>

<instructions>
1. Detect the document's region (e.g., Portugal, UK, Spain).
2. Use the provided mapping table to populate the 'vendor_tax_id' and 'tax_total'.
3. Categorize each item into exactly one of the allowed categories.
4. Return ONLY the JSON, no markdown fences, no explanation.
</instructions>

<constraints>
- ONLY use these categories: ["supermarket", "utilities", "restaurant", "office_supplies", "fuel", "other"]
- Do NOT guess Tax IDs. If absent, return null.
- If the image is not a receipt/invoice/bill, set "not_receipt" to true.
</constraints>

<extraction_spec>
{
  "not_receipt": boolean,
  "store": string | null,
  "vendor_tax_id": string | null,
  "customer_tax_id": string | null,
  "date": string | null, // YYYY-MM-DD
  "invoice_number": string | null,
  "subtotal": number | null,
  "tax_total": number | null,
  "total_paid": number | null,
  "payment_method": string | null,
  "items": [{
    "name": string,
    "category": "supermarket" | "utilities" | "restaurant" | "office_supplies" | "fuel" | "other",
    "qty": number,
    "unit_price": number,
    "tax_rate": number | null,
    "total": number
  }]
}
</extraction_spec>`;
