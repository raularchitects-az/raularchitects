"use client";

import { useFormStatus } from "react-dom";

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-charcoal/50">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "border border-charcoal/15 bg-white px-3 py-2.5 text-sm text-charcoal outline-none focus:border-bronze-dark";

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputClass} ${props.className ?? ""}`} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputClass} min-h-32 ${props.className ?? ""}`} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${inputClass} ${props.className ?? ""}`} />;
}

export function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-charcoal px-5 py-2.5 text-xs font-medium uppercase tracking-[0.18em] text-cream disabled:opacity-60"
    >
      {pending ? "Saxlanılır…" : children}
    </button>
  );
}

export function ConfirmButton({
  label,
  confirm,
  className,
  onConfirm,
}: {
  label: string;
  confirm: string;
  className?: string;
  onConfirm: () => void | Promise<void>;
}) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        if (window.confirm(confirm)) void onConfirm();
      }}
    >
      {label}
    </button>
  );
}
