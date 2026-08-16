import { Footer } from "@/components/footer";
import { getSiteSettings } from "@/lib/cms/public";

export async function SiteFooter() {
  const { footer } = await getSiteSettings();
  const credit = typeof footer?.credit === "string" && footer.credit.trim() ? String(footer.credit) : undefined;
  return <Footer credit={credit} />;
}
