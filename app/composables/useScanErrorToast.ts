// app/composables/useScanErrorToast.ts | Composable | Parsing context
// Maps scan/parse server errors (ERROR_CODES + HTTP status) to user-facing toasts.

import { ERROR_CODES } from "#shared/constants/errors";

const BY_CODE: Record<string, string> = {
  [ERROR_CODES.NOT_A_RECEIPT]:
    "This image is not a shopping receipt — try a different photo",
  [ERROR_CODES.AI_RESPONSE_PARSE_FAILED]:
    "Service issue — could not read the response, please retry",
  [ERROR_CODES.UNSUPPORTED_MEDIA_TYPE]:
    "Unsupported file type or size — use a JPEG or PNG up to 10 MB",
};

const BY_STATUS: Record<number, string> = {
  429: "Too many requests — wait a moment and retry",
  503: "Service temporarily unavailable — try again later",
  502: "Could not read receipt — try again",
  // 422 intentionally omitted — all 422s carry an ERROR_CODE handled above
};

export const useScanErrorToast = () => {
  const toast = useToast();

  function show(err: any) {
    const status = err?.statusCode ?? err?.status;
    const code = err?.data?.code as string | undefined;

    const title =
      (code && BY_CODE[code]) ??
      (status && BY_STATUS[status]) ??
      "Could not read receipt — try again";

    toast.add({ title, color: "error" });
  }

  return { show };
};
