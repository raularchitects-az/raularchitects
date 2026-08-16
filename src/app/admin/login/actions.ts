"use server";

import { redirect } from "next/navigation";
import { getSupabaseAnonKey, getSupabaseUrl, isCmsConfigured, isSecretSupabaseKey } from "@/lib/cms/env";
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

function authErrorMessage(error: { message?: string; code?: string; name?: string; status?: number }) {
  const message = (error.message ?? "").toLowerCase();
  const code = (error.code ?? "").toLowerCase();
  const detail = [error.code, error.message].filter(Boolean).join(" — ");

  if (code === "invalid_credentials" || message.includes("invalid login credentials")) {
    return "Email və ya şifrə yalnışdır.";
  }
  if (message.includes("email not confirmed") || code === "email_not_confirmed") {
    return "Email təsdiqlənməyib. Supabase → Authentication → Users-də istifadəçini Confirm edin.";
  }
  if (
    message.includes("invalid api key") ||
    message.includes("invalid jwt") ||
    code === "unauthorized" ||
    error.status === 401
  ) {
    return "Supabase anon/publishable açarı yalnışdır. Vercel env dəyərlərini yoxlayıb Redeploy edin.";
  }
  if (message.includes("failed to fetch") || message.includes("network") || message.includes("fetch failed")) {
    return "Supabase-ə qoşulmaq mümkün olmadı. NEXT_PUBLIC_SUPABASE_URL dəyərini yoxlayın.";
  }
  if (message.includes("unexpected token") || message.includes("not valid json")) {
    return "Supabase URL səhvdir. Dəyər https://YOUR_PROJECT.supabase.co olmalıdır, sayt ünvanı yox.";
  }

  return detail ? `Giriş alınmadı: ${detail}` : "Giriş alınmadı. Email, şifrə və Supabase ayarlarını yoxlayın.";
}

export async function loginAction(prev: LoginState | FormData, formData?: FormData): Promise<LoginState> {
  if (!isCmsConfigured()) {
    return {
      error: "Supabase environment variables tapılmadı. Vercel-də 4 dəyişəni əlavə edib Redeploy edin.",
    };
  }
  if (isSecretSupabaseKey(getSupabaseAnonKey())) {
    return {
      error: "NEXT_PUBLIC_SUPABASE_ANON_KEY gizli açardır. Anon / sb_publishable açarını istifadə edin.",
    };
  }

  const supabaseUrl = getSupabaseUrl();
  if (!supabaseUrl.startsWith("https://")) {
    return { error: "NEXT_PUBLIC_SUPABASE_URL https:// ilə başlamalıdır." };
  }
  if (!/supabase/i.test(supabaseUrl)) {
    return {
      error: "NEXT_PUBLIC_SUPABASE_URL səhvdir. Dəyər https://YOUR_PROJECT.supabase.co olmalıdır, sayt ünvanı yox.",
    };
  }

  const { email, password } = fieldsFromArgs(prev, formData);
  if (!email || !password) {
    return { error: "Email və şifrə tələb olunur." };
  }

  try {
    const supabase = await createUserServerClient();
    if (!supabase) {
      return { error: "Supabase environment variables tapılmadı. Vercel-də dəyişənləri yoxlayıb Redeploy edin." };
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      console.error("[admin login]", error?.name, error?.code, error?.message, error?.status);
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
      return { error: "Profil yoxlanılmadı. Supabase SQL Editor-də schema.sql-i işlədin." };
    }

    if (profile?.role !== "admin" && profile?.role !== "editor") {
      await supabase.auth.signOut();
      return {
        error:
          "Bu hesabın admin paneli üçün icazəsi yoxdur. Supabase-də profiles cədvəlinə bu user üçün role = admin yazın.",
      };
    }

    redirect("/admin");
  } catch (err) {
    const digest = typeof err === "object" && err && "digest" in err ? String((err as { digest: string }).digest) : "";
    if (digest.startsWith("NEXT_REDIRECT")) throw err;
    const message = err instanceof Error ? err.message : "naməlum xəta";
    console.error("[admin login] throw", message);
    return { error: `Giriş alınmadı: ${message}` };
  }
}
