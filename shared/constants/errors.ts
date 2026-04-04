// shared/constants/errors.ts | Constants | Shared
// Defines shared error codes and error payload shapes used by server and client.
// Aligns Nuxt $fetch errors with domain-safe codes for UI mapping.
// Needs: Nuxt $fetch (ofetch FetchError) as underlying error type

export const ERROR_CODES = {
  NOT_A_RECEIPT: "NOT_A_RECEIPT",
  AI_RESPONSE_PARSE_FAILED: "AI_RESPONSE_PARSE_FAILED",
  UNSUPPORTED_MEDIA_TYPE: "UNSUPPORTED_MEDIA_TYPE",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

export interface ApiErrorPayload {
  code: ErrorCode;
  message?: string;
}

// Minimal shape that Nuxt $fetch throws for HTTP errors.
// Note: we keep this project-local instead of importing ofetch types directly
// to avoid leaking implementation details everywhere.
export interface ApiFetchError extends Error {
  statusCode?: number;
  data?: ApiErrorPayload;
}
