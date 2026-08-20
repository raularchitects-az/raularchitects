"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { SiteStatusScreen } from "@/components/site-status-screen";

export default function LocaleError({
  error,
  retry,
  reset,
}: {
  error: Error & { digest?: string };
  retry?: () => void;
  reset?: () => void;
}) {
  const t = useTranslations("errors");
  const recover = retry ?? reset;

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <SiteStatusScreen
      title={t("title")}
      body={t("body")}
      homeLabel={t("home")}
      retryLabel={t("retry")}
      onRetry={recover}
    />
  );
}
