import { getTranslations } from "next-intl/server";
import { SiteStatusScreen } from "@/components/site-status-screen";

export default async function LocaleNotFound() {
  const t = await getTranslations("errors");

  return (
    <SiteStatusScreen
      title={t("notFoundTitle")}
      body={t("notFoundBody")}
      homeLabel={t("home")}
    />
  );
}
