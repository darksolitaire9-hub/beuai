export type ReceiptLanguage = "pt" | "en" | "es" | "de" | "hi" | "zh";

export const LANGUAGE_LABELS: Record<ReceiptLanguage, string> = {
  pt: "🇵🇹 PT",
  en: "🇬🇧 EN",
  es: "🇪🇸 ES",
  de: "🇩🇪 DE",
  hi: "🇮🇳 HI",
  zh: "🇨🇳 ZH",
};

export const useReceiptLanguage = () => {
  const lang = useState<ReceiptLanguage>("receipt-language", () => "pt");
  const set = (l: ReceiptLanguage) => {
    lang.value = l;
  };
  return { lang, set };
};
