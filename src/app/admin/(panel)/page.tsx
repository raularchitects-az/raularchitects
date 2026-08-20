import Link from "next/link";
import { ImportStaticButton } from "@/components/admin/import-static-button";
import { MigrateLegacyButton } from "@/components/admin/migrate-legacy-button";
import { requireStaff } from "@/lib/cms/auth";
import { dashboardStats, recentAudit } from "@/lib/cms/queries";
import { isCmsConfigured } from "@/lib/cms/env";

export default async function AdminDashboardPage() {
  if (!isCmsConfigured()) return null;
  const { profile } = await requireStaff();
  const stats = await dashboardStats();
  const audit = await recentAudit();

  const cards = [
    { label: "Layihələr", ...stats.projects, href: "/admin/projects" },
    { label: "Portfolio", ...stats.portfolio, href: "/admin/portfolio" },
    { label: "Bloq", ...stats.blog, href: "/admin/blog" },
  ];

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <p className="mt-2 text-sm text-charcoal/60">Kontent statistikası və son dəyişikliklər</p>
      </div>
      {stats.projects.total + stats.portfolio.total + stats.blog.total === 0 ? (
        <div className="border border-charcoal/10 bg-white p-6">
          <h2 className="text-lg font-medium">CMS hələ boşdur</h2>
          <p className="mt-2 max-w-2xl text-sm text-charcoal/60">
            Canlı saytdakı layihə, portfolio və bloq hələ də statik fayllardadır. Onları adminə draft kimi
            gətirmək üçün import edin, yoxlayın, sonra Publish edin. Publish etmədən public sayt dəyişmir.
          </p>
          {profile.role === "admin" ? (
            <div className="mt-5">
              <ImportStaticButton prominent />
            </div>
          ) : (
            <p className="mt-4 text-sm text-charcoal/50">Import üçün admin hesabı lazımdır.</p>
          )}
        </div>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <Link key={card.label} href={card.href} className="border border-charcoal/10 bg-white p-5">
            <div className="text-xs uppercase tracking-[0.16em] text-charcoal/50">{card.label}</div>
            <div className="mt-3 text-3xl font-semibold">{card.total}</div>
            <div className="mt-2 text-xs text-charcoal/50">
              Published {card.published} · Draft {card.draft}
            </div>
          </Link>
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        <Link href="/admin/projects/new" className="bg-charcoal px-4 py-2.5 text-xs uppercase tracking-[0.16em] text-cream">
          Yeni layihə
        </Link>
        <Link href="/admin/portfolio/new" className="border border-charcoal px-4 py-2.5 text-xs uppercase tracking-[0.16em]">
          Yeni portfolio
        </Link>
        <Link href="/admin/blog/new" className="border border-charcoal px-4 py-2.5 text-xs uppercase tracking-[0.16em]">
          Yeni blog yazısı
        </Link>
        {profile.role === "admin" ? (
          <>
            <ImportStaticButton />
            <MigrateLegacyButton />
          </>
        ) : null}
      </div>
      <section>
        <h2 className="mb-4 text-sm font-medium uppercase tracking-[0.16em]">Son dəyişikliklər</h2>
        <ul className="divide-y divide-charcoal/10 border border-charcoal/10 bg-white">
          {audit.map((item) => (
            <li key={item.id} className="px-4 py-3 text-sm">
              <span className="font-medium">{item.action}</span> · {item.entity_type} · {item.summary}
              <div className="text-xs text-charcoal/40">{new Date(item.created_at).toLocaleString("az-AZ")}</div>
            </li>
          ))}
          {audit.length === 0 ? <li className="px-4 py-6 text-sm text-charcoal/50">Hələ qeyd yoxdur.</li> : null}
        </ul>
      </section>
    </div>
  );
}
