// server/utils/validate-upload.ts | Utility | Parsing context
// Validates incoming upload parameters (mime type and base64 size) before calling the AI.

import { ERROR_CODES } from "#shared/constants/errors";

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png"]);
const MAX_BASE64_LENGTH = 14_000_000; // ≈ 10 MB binary including base64 overhead

export function assertValidUploadInput(mimeType: string, base64: string) {
  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    throw createError({
      statusCode: 415,
      data: { code: ERROR_CODES.UNSUPPORTED_MEDIA_TYPE },
      message: "Only JPEG and PNG images are supported",
    });
  }

  if (base64.length > MAX_BASE64_LENGTH) {
    throw createError({
      statusCode: 413,
      data: { code: ERROR_CODES.UNSUPPORTED_MEDIA_TYPE },
      message: "Image too large — max 10 MB",
    });
  }
}
