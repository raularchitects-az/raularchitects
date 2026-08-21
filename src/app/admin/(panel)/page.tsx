import Link from "next/link";
import { requireStaff } from "@/lib/cms/auth";
import { dashboardStats } from "@/lib/cms/queries";
import { isCmsConfigured } from "@/lib/cms/env";

export default async function AdminDashboardPage() {
  if (!isCmsConfigured()) return null;
  await requireStaff();
  const stats = await dashboardStats();

  const cards = [
    { label: "Layihələr", ...stats.projects, href: "/admin/projects" },
    { label: "Insights", ...stats.insights, href: "/admin/insights" },
    { label: "Bloq", ...stats.blog, href: "/admin/blog" },
  ];

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-3xl font-semibold">Ana səhifə</h1>
        <p className="mt-2 text-sm text-charcoal/60">Kontentə baxış və tez əlavə</p>
      </div>
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
        <Link href="/admin/insights/new" className="border border-charcoal px-4 py-2.5 text-xs uppercase tracking-[0.16em]">
          Yeni Insight
        </Link>
        <Link href="/admin/blog/new" className="border border-charcoal px-4 py-2.5 text-xs uppercase tracking-[0.16em]">
          Yeni bloq yazısı
        </Link>
      </div>
    </div>
  );
}
