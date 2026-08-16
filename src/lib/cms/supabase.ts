import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseAnonKey, getSupabaseUrl, isCmsConfigured, isServiceRoleKey } from "./env";
import { getSupabaseServiceRoleKey } from "./env-server";

export async function createUserServerClient() {
  if (!isCmsConfigured()) return null;
  const cookieStore = await cookies();
  return createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : "";
          if (message.includes("Cookies can only be modified")) return;
          throw error;
        }
      },
    },
  });
}

export function createServiceClient() {
  const url = getSupabaseUrl();
  const key = getSupabaseServiceRoleKey();
  if (!url || !isServiceRoleKey(key)) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function createAuthedClient(accessToken: string) {
  const url = getSupabaseUrl();
  const anon = getSupabaseAnonKey();
  if (!url || !anon || !accessToken) return null;
  return createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
}

/** Staff pages already ran requireStaff. Prefer service role so RLS/JWT gaps don't hide rows. */
export async function createAdminClient() {
  return createServiceClient() ?? (await createUserServerClient());
}
