import { requireAdmin } from "@/lib/cms/auth";
import { createUserServerClient } from "@/lib/cms/supabase";
import { updateUserRole } from "@/lib/cms/actions";

export default async function AdminUsersPage() {
  await requireAdmin();
  const supabase = await createUserServerClient();
  const { data } = supabase
    ? await supabase.from("profiles").select("id, role, full_name").order("created_at")
    : { data: [] };

  async function save(formData: FormData) {
    "use server";
    await updateUserRole(String(formData.get("id")), String(formData.get("role")) as "admin" | "editor");
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-semibold">İstifadəçilər</h1>
      <p className="text-sm text-charcoal/60">Editor kontent idarə edir. Admin rolları və sistem ayarlarını dəyişə bilər.</p>
      <div className="border border-charcoal/10 bg-white">
        {(data ?? []).map((user) => (
          <form key={user.id} action={save} className="flex flex-wrap items-center gap-3 border-b border-charcoal/5 px-4 py-3">
            <input type="hidden" name="id" value={user.id} />
            <span className="min-w-48 text-sm">{user.full_name || user.id}</span>
            <select name="role" defaultValue={user.role} className="border border-charcoal/15 px-2 py-1 text-sm">
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
            </select>
            <button type="submit" className="text-xs uppercase tracking-[0.14em]">
              Saxla
            </button>
          </form>
        ))}
      </div>
    </div>
  );
}
