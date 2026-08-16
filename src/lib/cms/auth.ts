import { redirect } from "next/navigation";
import { createAuthedClient, createServiceClient, createUserServerClient } from "./supabase";
import type { ProfileRow, StaffRole } from "./types";

async function queryProfile(client: NonNullable<ReturnType<typeof createServiceClient>>, userId: string) {
  const result = await client.from("profiles").select("id, role, full_name").eq("id", userId).maybeSingle();
  return { data: (result.data as ProfileRow | null) ?? null, error: result.error };
}

export async function loadProfileByUserId(userId: string, accessToken?: string) {
  const service = createServiceClient();
  if (service) {
    const result = await queryProfile(service, userId);
    if (!result.error) return result;
    console.error("[admin profile] service", result.error.code, result.error.message);
  }

  if (accessToken) {
    const authed = createAuthedClient(accessToken);
    if (authed) {
      const result = await queryProfile(authed, userId);
      if (!result.error) return result;
      console.error("[admin profile] token", result.error.code, result.error.message);
      return result;
    }
  }

  const userClient = await createUserServerClient();
  if (!userClient) {
    return { data: null as ProfileRow | null, error: { code: "no_client", message: "Supabase client yoxdur" } };
  }
  return queryProfile(userClient, userId);
}

export async function getSessionUser() {
  const supabase = await createUserServerClient();
  if (!supabase) return { user: null, profile: null as ProfileRow | null };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { user: null, profile: null as ProfileRow | null };
  const { data: profile } = await loadProfileByUserId(user.id);
  return { user, profile };
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
