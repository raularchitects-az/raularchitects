"use server";

import { getPublicContact } from "@/lib/cms/public";
import { defaultInquiryRecipient, sendInquiryEmail } from "@/lib/send-inquiry-email";

/** `code` lets localized callers render their own copy; `error` stays for existing callers. */
export type InquiryErrorCode = "required" | "email" | "send";

export type InquirySubmitResult = { ok: true } | { ok: false; error: string; code: InquiryErrorCode };

function clean(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

export async function submitInquiryForm(formData: FormData): Promise<InquirySubmitResult> {
  const name = clean(formData.get("name"));
  const email = clean(formData.get("email"));
  const message = clean(formData.get("message"));
  const project = clean(formData.get("project"));
  const pageUrl = clean(formData.get("pageUrl"));

  if (!name || !email || !message) {
    return { ok: false, code: "required", error: "Bütün sahələri doldurun." };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, code: "email", error: "E-poçt ünvanı düzgün deyil." };
  }

  try {
    const contact = await getPublicContact();
    await sendInquiryEmail({
      name,
      email,
      message,
      to: defaultInquiryRecipient(contact.email),
      project: project || undefined,
      pageUrl: pageUrl || undefined,
    });
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      code: "send",
      error: err instanceof Error ? err.message : "Göndərilmədi. Bir az sonra yenidən cəhd edin.",
    };
  }
}
