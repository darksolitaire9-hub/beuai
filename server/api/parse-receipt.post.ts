import { GoogleGenerativeAI } from "@google/generative-ai";

const PROMPT = `
You are a receipt parser. Extract all data from this receipt image into JSON.

Rules:
- Weighted items: "0.496 x 3.49" → qty: 0.496, unit_price: 3.49
- "Poupança Imediata" is a discount — attach it to the item ABOVE it as "discount"
- Use category headers (MERCEARIA, TALHO, FRUTAS E VEGETAIS, etc.) as item categories
- All monetary values as numbers, not strings
- date in ISO 8601 (YYYY-MM-DD)

Return ONLY this JSON, no markdown:
{
  "store": string,
  "date": string,
  "payment_method": string,
  "subtotal": number,
  "total_savings": number,
  "total_paid": number,
  "items": [{ "name": string, "category": string, "qty": number, "unit_price": number, "total": number, "discount": number }]
}
`;

export default defineEventHandler(async (event) => {
  const { base64, mimeType } = await readBody(event);

  if (!base64 || !mimeType)
    throw createError({
      statusCode: 400,
      message: "Missing base64 or mimeType",
    });

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY!);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-lite",
    generationConfig: { responseMimeType: "application/json", temperature: 0 },
  });

  let text = "";
  try {
    const response = await model.generateContent([
      PROMPT,
      { inlineData: { mimeType, data: base64 } },
    ]);
    text = response.response.text().trim();
    if (!text) throw new Error("EMPTY_RESPONSE");
  } catch (e: any) {
    if (e.message === "EMPTY_RESPONSE")
      throw createError({
        statusCode: 502,
        message: "Gemini returned empty response — retry",
      });
    throw createError({ statusCode: 502, message: "Gemini API error" });
  }

  let parsed: any;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw createError({
      statusCode: 422,
      message: "Could not parse Gemini response as JSON",
    });
  }

  const computedSubtotal =
    parsed.items?.reduce(
      (sum: number, item: any) =>
        sum + (item.total ?? 0) - (item.discount ?? 0),
      0,
    ) ?? 0;
  const drift = Math.abs(computedSubtotal - (parsed.subtotal ?? 0));

  return {
    ...parsed,
    _meta: { drift: Math.round(drift * 100) / 100, trusted: drift < 0.05 },
  };
});
