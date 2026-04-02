import type { PromptLanguage } from "./types";

/**
 * Default language used when no x-receipt-language header is sent.
 * Change this to shift the default for all users.
 * Supported: 'pt' | 'en' | 'es'
 */
export const FALLBACK_LANG: PromptLanguage = "pt";
