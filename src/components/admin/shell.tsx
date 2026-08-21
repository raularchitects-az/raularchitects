"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/lib/cms/actions";
import type { ProfileRow } from "@/lib/cms/types";

const nav = [
  { href: "/admin", label: "Ana səhifə" },
  { href: "/admin/projects", label: "Layihələr" },
  { href: "/admin/insights", label: "Insights" },
  { href: "/admin/blog", label: "Bloq" },
  { href: "/admin/services", label: "Xidmətlər" },
  { href: "/admin/pages", label: "Səhifələr" },
  { href: "/admin/media", label: "Fayllar" },
  { href: "/admin/audit", label: "Jurnal" },
];

export function AdminShell({
  children,
  profile,
}: {
  children: React.ReactNode;
  profile: ProfileRow;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#f7f2ec] text-[#47484c]">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="border-b border-charcoal/10 bg-white lg:w-56 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between px-5 py-4 lg:block">
            <Link href="/admin" className="text-sm font-semibold uppercase tracking-[0.18em]">
              RAUL CMS
            </Link>
            <span className="text-[10px] uppercase tracking-[0.16em] text-charcoal/40">{profile.role}</span>
          </div>
          <nav className="flex flex-wrap gap-1 px-3 pb-4 lg:flex-col">
            {nav.map((item) => {
              const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 text-xs uppercase tracking-[0.14em] ${
                    active ? "bg-charcoal text-cream" : "text-charcoal/70 hover:bg-cream"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            {profile.role === "admin" ? (
              <>
                <Link
                  href="/admin/rollout"
                  className={`px-3 py-2 text-xs uppercase tracking-[0.14em] ${
                    pathname.startsWith("/admin/rollout")
                      ? "bg-charcoal text-cream"
                      : "text-charcoal/70 hover:bg-cream"
                  }`}
                >
                  Insights rollout
                </Link>
                <Link
                  href="/admin/users"
                  className={`px-3 py-2 text-xs uppercase tracking-[0.14em] ${
                    pathname.startsWith("/admin/users") ? "bg-charcoal text-cream" : "text-charcoal/70 hover:bg-cream"
                  }`}
                >
                  İstifadəçilər
                </Link>
              </>
            ) : null}
          </nav>
          <form action={logoutAction} className="px-5 pb-5">
            <button type="submit" className="text-[11px] uppercase tracking-[0.16em] text-charcoal/50">
              Çıxış
            </button>
          </form>
        </aside>
        <main className="flex-1 p-5 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
