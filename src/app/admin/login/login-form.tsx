"use client";

import { useActionState } from "react";
import { Field, SubmitButton, TextInput } from "@/components/admin/fields";
import { loginAction, type LoginState } from "./actions";

export function LoginForm({ configured }: { configured: boolean }) {
  const [state, formAction] = useActionState(loginAction, null as LoginState);
  const error = state?.error || (!configured
    ? "Lokal Supabase ayarları yoxdur. Layihə kökündə .env.local yaradıb Vercel-dəki 3 dəyişəni yazın, sonra npm run dev-i yenidən başladın."
    : "");

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f2ec] p-6">
      <form action={formAction} className="w-full max-w-sm border border-charcoal/10 bg-white p-8">
        <h1 className="text-xl font-semibold tracking-wide">RAUL CMS</h1>
        <p className="mt-2 text-sm text-charcoal/60">Yalnız səlahiyyətli istifadəçilər</p>
        <div className="mt-8 flex flex-col gap-4">
          <Field label="Email">
            <TextInput name="email" type="email" required autoComplete="username" />
          </Field>
          <Field label="Şifrə">
            <TextInput name="password" type="password" required autoComplete="current-password" />
          </Field>
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          <SubmitButton>Daxil ol</SubmitButton>
        </div>
      </form>
    </div>
  );
}
