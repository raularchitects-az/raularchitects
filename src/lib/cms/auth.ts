import { redirect } from "next/navigation";
import { createUserServerClient } from "./supabase";
import type { ProfileRow, StaffRole } from "./types";

export async function getSessionUser() {
  const supabase = await createUserServerClient();
  if (!supabase) return { user: null, profile: null as ProfileRow | null };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { user: null, profile: null as ProfileRow | null };
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, full_name")
    .eq("id", user.id)
    .maybeSingle();
  return { user, profile: profile as ProfileRow | null };
}

export async function requireStaff() {
  const { user, profile } = await getSessionUser();
  if (!user || !profile) redirect("/admin/login");
  return { user, profile };
}

export async function requireAdmin() {
  const session = await requireStaff();
  if (session.profile.role !== "admin") redirect("/admin");
  return session;
}

export function canManageUsers(role: StaffRole) {
  return role === "admin";
}
