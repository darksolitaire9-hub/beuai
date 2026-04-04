// server/api/parse-receipt.post.ts | Server route | Parsing context
// Receives a base64 receipt image, calls the AI parser, validates and returns ParsedReceipt.
// Internal field not_receipt is stripped before returning — client types remain unchanged.

import { GoogleGenerativeAI } from "@google/generative-ai";
import { PROMPTS } from "../prompts/index";
import { FALLBACK_LANG, GEMINI_MODEL } from "../config";
import { ERROR_CODES } from "#shared/constants/errors";
import { assertValidUploadInput } from "../utils/validate-upload";
import type { PromptLanguage } from "../types";

export default defineEventHandler(async (event) => {
  const { base64, mimeType } = await readBody<{
    base64: string;
    mimeType: string;
  }>(event);

  if (!base64 || !mimeType) {
    throw createError({
      statusCode: 400,
      message: "Missing base64 or mimeType",
    });
  }

  // Validate MIME type and payload size before hitting the AI
  assertValidUploadInput(mimeType, base64);

  const lang = (getHeader(event, "x-receipt-language") ??
    FALLBACK_LANG) as PromptLanguage;
  const prompt = PROMPTS[lang] ?? PROMPTS[FALLBACK_LANG];

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY!);
  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    generationConfig: {
      responseMimeType: "application/json", // recommended pattern [web:57]
      temperature: 0,
    },
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
    console.error(
      "[ai:parse] raw error:",
      e?.message,
      e?.status,
      e?.errorDetails,
    );

    if (e.message === "EMPTY_RESPONSE")
      throw createError({
        statusCode: 502,
        message: "Empty response from AI — retry",
      });

    if (
      e.status === 429 ||
      e?.errorDetails?.[0]?.reason === "RATE_LIMIT_EXCEEDED"
    )
      throw createError({
        statusCode: 429,
        message: "AI rate limit reached — try again later",
      });

    if (e.status === 404)
      throw createError({
        statusCode: 503,
        message: "AI model unavailable — service may have changed",
      });

    if (e.status === 401 || e.status === 403)
      throw createError({
        statusCode: 503,
        message: "AI authentication failed — check API key",
      });

    throw createError({ statusCode: 502, message: "AI service error — retry" });
  }

  let parsed: any;
  try {
    // Following Google’s recommended pattern: model returns JSON text, we parse it. [web:57]
    parsed = JSON.parse(text);
  } catch {
    throw createError({
      statusCode: 422,
      data: { code: ERROR_CODES.AI_RESPONSE_PARSE_FAILED },
      message: "Could not parse AI response — retry",
    });
  }

  // Strict check — only literal true signals a non-receipt image
  if (parsed?.not_receipt === true) {
    throw createError({
      statusCode: 422,
      data: { code: ERROR_CODES.NOT_A_RECEIPT },
      message: "Image is not a shopping receipt",
    });
  }

  // Internal field — must not leak into client-visible types
  if ("not_receipt" in parsed) {
    delete parsed.not_receipt;
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
