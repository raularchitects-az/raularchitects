import { Footer } from "@/components/footer";
import { getSiteSettings } from "@/lib/cms/public";
import { isInsightsRestructureActive } from "@/lib/cms/insights-rollout";

export async function SiteFooter() {
  const [{ footer }, insightsActive] = await Promise.all([getSiteSettings(), isInsightsRestructureActive()]);
  const credit = typeof footer?.credit === "string" && footer.credit.trim() ? String(footer.credit) : undefined;
  return <Footer credit={credit} insightsActive={insightsActive} />;
}
