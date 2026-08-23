"use server";

import { getPublicContact } from "@/lib/cms/public";
import { defaultInquiryRecipient, sendInquiryEmail } from "@/lib/send-inquiry-email";

export type InquirySubmitResult = { ok: true } | { ok: false; error: string };

function clean(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

export async function submitInquiryForm(formData: FormData): Promise<InquirySubmitResult> {
  const name = clean(formData.get("name"));
  const email = clean(formData.get("email"));
  const message = clean(formData.get("message"));

  if (!name || !email || !message) {
    return { ok: false, error: "Bütün sahələri doldurun." };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "E-poçt ünvanı düzgün deyil." };
  }

  try {
    const contact = await getPublicContact();
    await sendInquiryEmail({
      name,
      email,
      message,
      to: defaultInquiryRecipient(contact.email),
    });
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Göndərilmədi. Bir az sonra yenidən cəhd edin.",
    };
  }
}
