// server/prompts/schema.ts | Constants | Parsing context
// JSON schema string injected at the end of every language prompt.
// not_receipt is an internal signal stripped on the server before returning to the client.

export const BASE_SCHEMA = `
Return ONLY this JSON, no markdown fences, no explanation:
{
  "not_receipt": boolean,
  "store": string,
  "date": string,
  "payment_method": string,
  "subtotal": number,
  "total_savings": number,
  "total_paid": number,
  "items": [{
    "name": string,
    "category": string,
    "qty": number,
    "unit_price": number,
    "total": number,
    "discount": number,
    "pack": {
      "units": number,
      "volume": string,
      "unit_cost": number
    } | null
  }]
}`;
