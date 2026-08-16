"use client";

import { useState } from "react";
import { loginAction } from "@/lib/cms/actions";
import { Field, SubmitButton, TextInput } from "@/components/admin/fields";

export default function AdminLoginPage() {
  const [error, setError] = useState("");

  async function action(formData: FormData) {
    setError("");
    try {
      await loginAction(formData);
    } catch (err) {
      const digest = typeof err === "object" && err && "digest" in err ? String((err as { digest: string }).digest) : "";
      if (digest.startsWith("NEXT_REDIRECT")) throw err;
      setError(err instanceof Error ? err.message : "Giriş alınmadı");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f2ec] p-6">
      <form action={action} className="w-full max-w-sm border border-charcoal/10 bg-white p-8">
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
