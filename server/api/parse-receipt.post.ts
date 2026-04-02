import { GoogleGenerativeAI } from "@google/generative-ai";
import { PROMPTS } from "../prompts/index";
import { FALLBACK_LANG } from "../config";
import type { PromptLanguage } from "../types";

export default defineEventHandler(async (event) => {
  const { base64, mimeType } = await readBody(event);

  if (!base64 || !mimeType)
    throw createError({
      statusCode: 400,
      message: "Missing base64 or mimeType",
    });

  const lang = (getHeader(event, "x-receipt-language") ??
    FALLBACK_LANG) as PromptLanguage;
  const prompt = PROMPTS[lang] ?? PROMPTS[FALLBACK_LANG];

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY!);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-lite",
    generationConfig: { responseMimeType: "application/json", temperature: 0 },
  });

  let text = "";
  try {
    const response = await model.generateContent([
      prompt,
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
