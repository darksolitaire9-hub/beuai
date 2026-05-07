// app/features/parsing/api/useReceiptApi.ts
import type { ParsedReceipt } from "../types/receipt";

export const useReceiptApi = () => {
  const parse = async (base64: string, mimeType: string, lang: string) => {
    return await $fetch<ParsedReceipt>("/api/parse-receipt", {
      method: "POST",
      headers: {
        "x-receipt-language": lang,
      },
      body: { base64, mimeType },
    });
  };

  return { parse };
};
