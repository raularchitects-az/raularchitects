"use client";

import { useActionState } from "react";
import { Field, SubmitButton, TextInput } from "@/components/admin/fields";
import { loginAction, type LoginState } from "./actions";

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, null as LoginState);

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
          {state?.error ? <p className="text-sm text-red-700">{state.error}</p> : null}
          <SubmitButton>Daxil ol</SubmitButton>
        </div>
      </form>
    </div>
  );
}
