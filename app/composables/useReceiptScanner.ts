import type { ParsedReceipt } from "~/types/receipt";
import type { ReceiptLanguage } from "~/composables/useReceiptLanguage";

export const useReceiptScanner = () => {
  const result = useState<ParsedReceipt | null>("scan-result", () => null);
  const loading = ref(false);
  const step = ref(0);
  const { lang } = useReceiptLanguage();

  const scan = async (blob: Blob) => {
    loading.value = true;
    step.value = 1;

    try {
      const base64Full = await blobToBase64(blob);
      const base64 = base64Full.split(",")[1];
      const mimeType = blob.type || "image/jpeg";

      step.value = 2;
      await delay(300);
      step.value = 3;

      const data = await $fetch<ParsedReceipt>("/api/parse-receipt", {
        method: "POST",
        headers: {
          "x-receipt-language": lang.value, // ← send selected language
        },
        body: { base64, mimeType },
      });

      step.value = 4;
      await delay(400);
      result.value = data;
    } finally {
      loading.value = false;
      step.value = 0;
    }
  };

  const clear = () => {
    result.value = null;
  };

  return { result, loading, step, scan, clear };
};

const blobToBase64 = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
