// app/composables/useReceiptScanner.ts | Composable | Parsing context
// Wraps the receipt scan flow: base64 encoding, request to /api/parse-receipt,
// and shared ParsedReceipt state for the scan results.
// Needs: useReceiptLanguage, Nuxt $fetch, blobToBase64, delay

import type { ParsedReceipt } from "../types/receipt";

export type ScanStage = "idle" | "compressing" | "analyzing";

export const useReceiptScanner = () => {
  const result = useState<ParsedReceipt | null>("scan-result", () => null);
  const loading = useState<boolean>("scan-loading", () => false);
  const stage = useState<ScanStage>("scan-stage", () => "idle");
  
  const { lang } = useReceiptLanguage();
  const { parse } = useReceiptApi();
  const { compressForOcr } = useImageCompression();

  const scan = async (blob: Blob) => {
    loading.value = true;
    stage.value = "compressing";

    try {
      // Step 1: Optimize & Strip Metadata
      const optimized = await compressForOcr(blob);
      
      // Mandatory UX delay so the user sees the "Securing privacy..." stage
      await delay(800);
      
      stage.value = "analyzing";
      
      // Step 2: Extract
      const base64Full = await blobToBase64(optimized);
      const base64 = base64Full.split(",")[1];
      const mimeType = optimized.type || "image/jpeg";

      const data = await parse(base64, mimeType, lang.value);
      result.value = {
        ...data,
        _image: base64Full
      };
    } catch (err) {
      throw err;
    } finally {
      loading.value = false;
      stage.value = "idle";
    }
  };

  const clear = () => {
    result.value = null;
  };

  return { result, loading, stage, scan, clear };
};

const blobToBase64 = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
