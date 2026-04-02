export const BASE_SCHEMA = `
Return ONLY this JSON, no markdown fences, no explanation:
{
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
