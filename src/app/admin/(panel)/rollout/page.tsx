import Link from "next/link";
import { ActivateInsightsButton } from "@/components/admin/activate-insights-button";
import { MigratePortfolioButton } from "@/components/admin/migrate-portfolio-button";
import { SeedInsightsButton } from "@/components/admin/seed-insights-button";
import { getInsightsRolloutStatus } from "@/lib/cms/actions";
import { requireAdmin } from "@/lib/cms/auth";

export default async function AdminInsightsRolloutPage() {
  await requireAdmin();
  let initialStatus = null;
  try {
    initialStatus = await getInsightsRolloutStatus();
  } catch {
    initialStatus = null;
  }

  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <div>
        <h1 className="text-3xl font-semibold">Insights rollout</h1>
        <p className="mt-2 text-sm text-charcoal/60">
          Staged keçid: əvvəl schema + migration + seed, sonra açıq aktivasiya. Heç bir addım avtomatik
          işə düşmür.
        </p>
      </div>

      <section className="flex flex-col gap-3 border border-charcoal/10 bg-white p-5">
        <h2 className="text-sm uppercase tracking-[0.16em]">1. Schema</h2>
        <p className="text-sm text-charcoal/70">
          Supabase SQL editor-də əl ilə işə salın (bu panel icra etmir):
        </p>
        <code className="block border border-charcoal/10 bg-cream px-3 py-2 text-sm">
          supabase/patch-insights.sql
        </code>
        <p className="text-xs text-charcoal/50">
          Fayl yolu: repo root-dakı <span className="font-medium">supabase/patch-insights.sql</span>
        </p>
      </section>

      <section className="flex flex-col gap-3 border border-charcoal/10 bg-white p-5">
        <h2 className="text-sm uppercase tracking-[0.16em]">2. Portfolio → Projects</h2>
        <p className="text-sm text-charcoal/70">
          Yalnız 3 real iş köçürülür. Portfolio sətirləri toxunulmur; public hələ Portfolio qalır.
          Redirect yazılmır.
        </p>
        <MigratePortfolioButton />
        <p className="text-xs text-charcoal/45">
          Eyni düymə{" "}
          <Link href="/admin/projects" className="underline underline-offset-2">
            Layihələr
          </Link>{" "}
          səhifəsində də var — əsas yer buradır.
        </p>
      </section>

      <section className="flex flex-col gap-3 border border-charcoal/10 bg-white p-5">
        <h2 className="text-sm uppercase tracking-[0.16em]">3. Seed Insights</h2>
        <p className="text-sm text-charcoal/70">
          10 Insights məqaləsini published kimi upsert edin (slug üzrə). Təsdiq tələb olunur.
        </p>
        <SeedInsightsButton />
      </section>

      <section className="flex flex-col gap-3 border border-charcoal/10 bg-white p-5">
        <h2 className="text-sm uppercase tracking-[0.16em]">4. Aktivasiya</h2>
        <p className="text-sm text-charcoal/70">
          Hazırlıq yoxlamalarından keçəndən sonra public-i Portfolio-dan Insights-ə keçirin. Redirect-lər
          yalnız bu addımda yazılır.
        </p>
        <ActivateInsightsButton initialStatus={initialStatus} />
      </section>
    </div>
  );
}
