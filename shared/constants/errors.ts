// shared/constants/errors.ts | Constants | Shared

export const ERROR_CODES = {
  NOT_A_RECEIPT: "NOT_A_RECEIPT",
  AI_RESPONSE_PARSE_FAILED: "AI_RESPONSE_PARSE_FAILED",
  UNSUPPORTED_MEDIA_TYPE: "UNSUPPORTED_MEDIA_TYPE",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
