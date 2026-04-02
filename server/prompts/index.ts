import type { PromptLanguage } from "../types"; // ← from shared types, not re-declared
import { PT_PROMPT } from "./pt";
import { EN_PROMPT } from "./en";
import { ES_PROMPT } from "./es";

export const PROMPTS: Record<PromptLanguage, string> = {
  pt: PT_PROMPT,
  en: EN_PROMPT,
  es: ES_PROMPT,
};

export type { PromptLanguage }; // re-export so consumers can import from either place
