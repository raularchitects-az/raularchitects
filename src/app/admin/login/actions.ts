"use server";

import { redirect } from "next/navigation";
import { getSupabaseAnonKey, isCmsConfigured, isSecretSupabaseKey } from "@/lib/cms/env";
import { createUserServerClient } from "@/lib/cms/supabase";

export type LoginState = { error: string } | null;

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (!isCmsConfigured()) {
    return { error: "Supabase environment variables təyin olunmayıb." };
  }
  if (isSecretSupabaseKey(getSupabaseAnonKey())) {
    return {
      error:
        "NEXT_PUBLIC_SUPABASE_ANON_KEY gizli açardır. Anon / sb_publishable açarını istifadə edin.",
    };
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) {
    return { error: "Email və şifrə tələb olunur." };
  }

  const supabase = await createUserServerClient();
  if (!supabase) {
    return { error: "Supabase environment variables təyin olunmayıb." };
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    return { error: "Email və ya şifrə yalnışdır." };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profileError) {
    await supabase.auth.signOut();
    return { error: "Profil yoxlanılmadı. Bir az sonra yenidən cəhd edin." };
  }

  if (profile?.role !== "admin" && profile?.role !== "editor") {
    await supabase.auth.signOut();
    return { error: "Bu hesabın admin paneli üçün icazəsi yoxdur." };
  }

  redirect("/admin");
}
