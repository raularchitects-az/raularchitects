import { AdminShell } from "@/components/admin/shell";
import { requireStaff } from "@/lib/cms/auth";
import { isCmsConfigured } from "@/lib/cms/env";

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  if (!isCmsConfigured()) {
    return (
      <div className="p-10 text-sm text-charcoal/70">
        Supabase environment variables təyin olunmayıb. <code>SETUP.md</code> faylına baxın.
      </div>
    );
  }
  const { profile } = await requireStaff();
  return <AdminShell profile={profile}>{children}</AdminShell>;
}
