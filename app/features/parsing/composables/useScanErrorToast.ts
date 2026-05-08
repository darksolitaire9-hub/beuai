// app/composables/useScanErrorToast.ts | Composable | Parsing context
// Maps scan/parse server errors (ERROR_CODES + HTTP status) to user-facing toasts.
// Uses ApiFetchError to keep error handling aligned with server error shape.
// Needs: shared/constants/errors (ERROR_CODES, ApiFetchError), useToast (Nuxt UI)

import { useToast } from "#imports";
import { ERROR_CODES } from "../../../../shared/constants/errors";
import type { ApiFetchError } from "../../../../shared/constants/errors";

const BY_CODE: Record<string, string> = {
  [ERROR_CODES.NOT_A_RECEIPT]:
    "This image is not a shopping receipt — try a different photo.",
  [ERROR_CODES.AI_RESPONSE_PARSE_FAILED]:
    "We could not read this receipt right now. Please try again in a moment.",
  [ERROR_CODES.UNSUPPORTED_MEDIA_TYPE]:
    "Unsupported file type or size — use a JPEG or PNG up to 10 MB.",
};

const BY_STATUS: Record<number, string> = {
  429: "Too many requests — please wait a bit before scanning again.",
  502: "Receipt service is temporarily unavailable. Please try again shortly.",
  503: "Receipt service is temporarily unavailable. Please try again shortly.",
};

export const useScanErrorToast = () => {
  const toast = useToast();

  const show = (err: ApiFetchError) => {
    const innerData = (err as any).data as any;
    const code = innerData?.data?.code as string | undefined;
    const status = err.statusCode;

    const messageFromCode = code ? BY_CODE[code] : undefined;
    const messageFromStatus = status ? BY_STATUS[status] : undefined;

    const description =
      messageFromCode ??
      messageFromStatus ??
      "We could not read this receipt. Please try again with a clearer photo.";

    toast.add({
      id: "scan-error",
      color: "warning",
      title: "Scan failed",
      description,
    });
  };

  return { show };
};
