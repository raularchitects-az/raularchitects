"use server";

import { redirect } from "next/navigation";
import { getSupabaseAnonKey, isCmsConfigured, isSecretSupabaseKey } from "@/lib/cms/env";
import { createUserServerClient } from "@/lib/cms/supabase";

export type LoginState = { error: string } | null;

function readField(source: FormData | null | undefined, key: string) {
  if (!source || typeof source.get !== "function") return "";
  return String(source.get(key) ?? "").trim();
}

function fieldsFromArgs(prev: LoginState | FormData, formData?: FormData) {
  const data = prev instanceof FormData ? prev : formData;
  return {
    email: readField(data, "email"),
    password: readField(data, "password"),
  };
}

function authErrorMessage(error: { message?: string; code?: string; status?: number }) {
  const message = (error.message ?? "").toLowerCase();
  const code = (error.code ?? "").toLowerCase();

  if (code === "invalid_credentials" || message.includes("invalid login credentials")) {
    return "Email və ya şifrə yalnışdır.";
  }
  if (message.includes("email not confirmed") || code === "email_not_confirmed") {
    return "Email təsdiqlənməyib. Supabase-də Auto Confirm aktiv edin.";
  }
  if (
    message.includes("invalid api key") ||
    message.includes("jwt") ||
    code === "unauthorized" ||
    error.status === 401
  ) {
    return "Supabase açarı yalnışdır. .env.local-də anon / publishable açarı yoxlayın.";
  }
  if (message.includes("failed to fetch") || message.includes("network") || message.includes("fetch")) {
    return "Supabase-ə qoşulmaq mümkün olmadı. URL-i və interneti yoxlayın.";
  }

  return "Giriş alınmadı. Email, şifrə və Supabase ayarlarını yoxlayın.";
}

export async function loginAction(prev: LoginState | FormData, formData?: FormData): Promise<LoginState> {
  if (!isCmsConfigured()) {
    return {
      error:
        "Lokal Supabase ayarları yoxdur. Layihə kökündə .env.local yaradıb Vercel-dəki 3 dəyişəni yazın, sonra npm run dev-i yenidən başladın.",
    };
  }
  if (isSecretSupabaseKey(getSupabaseAnonKey())) {
    return {
      error:
        "NEXT_PUBLIC_SUPABASE_ANON_KEY gizli açardır. Anon / sb_publishable açarını istifadə edin.",
    };
  }

  const { email, password } = fieldsFromArgs(prev, formData);
  if (!email || !password) {
    return { error: "Email və şifrə tələb olunur." };
  }

  const supabase = await createUserServerClient();
  if (!supabase) {
    return {
      error:
        "Lokal Supabase ayarları yoxdur. Layihə kökündə .env.local yaradıb Vercel-dəki 3 dəyişəni yazın.",
    };
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    console.error("[admin login]", error?.code ?? "no_user", error?.message ?? "missing user");
    return { error: authErrorMessage(error ?? { message: "invalid login credentials" }) };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profileError) {
    console.error("[admin login] profile", profileError.code, profileError.message);
    await supabase.auth.signOut();
    return { error: "Profil yoxlanılmadı. Supabase-də schema.sql və RLS siyasətlərini işlədin." };
  }

  if (profile?.role !== "admin" && profile?.role !== "editor") {
    await supabase.auth.signOut();
    return { error: "Bu hesabın admin paneli üçün icazəsi yoxdur. profiles cədvəlinə admin rolunu əlavə edin." };
  }

  redirect("/admin");
}
