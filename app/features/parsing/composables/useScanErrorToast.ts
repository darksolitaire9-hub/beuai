// app/composables/useScanErrorToast.ts | Composable | Parsing context
// Maps scan/parse server errors (ERROR_CODES + HTTP status) to user-facing toasts.
// Uses ApiFetchError to keep error handling aligned with server error shape.
// Needs: shared/constants/errors (ERROR_CODES, ApiFetchError), useToast (Nuxt UI)

import { useToast } from "#imports";
import { ERROR_CODES } from "~~/shared/constants/errors";
import type { ApiFetchError } from "~~/shared/constants/errors";

export const useScanErrorToast = () => {
  const toast = useToast();
  const { t } = useI18n();

  const show = (err: ApiFetchError) => {
    const innerData = (err as any).data as any;
    const code = innerData?.data?.code as string | undefined;
    const status = err.statusCode;

    // Resolve description from i18n (DDD mapping)
    let description = t("api_errors.generic");

    if (code && code in ERROR_CODES) {
      description = t(`api_errors.${code}`);
    } else if (status && [429, 502, 503].includes(status)) {
      description = t(`api_errors.HTTP_${status}`);
    }

    toast.add({
      id: "scan-error",
      color: "warning",
      title: t("scan.alerts.scan_failed"),
      description,
    });
  };

  return { show };
};
