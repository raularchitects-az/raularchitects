type InquiryPayload = {
  name: string;
  email: string;
  message: string;
  to: string;
};

function inquiryFromAddress() {
  return process.env.INQUIRY_FROM_EMAIL?.trim() || "Raul Architects <onboarding@resend.dev>";
}

export async function sendInquiryEmail(payload: InquiryPayload) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "RESEND_API_KEY is not configured. Add it to .env.local (server-only) and verify your domain in Resend.",
    );
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: inquiryFromAddress(),
      to: [payload.to],
      reply_to: payload.email,
      subject: `Müraciət formu: ${payload.name}`,
      text: [`Ad: ${payload.name}`, `E-poçt: ${payload.email}`, "", payload.message].join("\n"),
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Email göndərilmədi (${response.status}): ${detail || response.statusText}`);
  }
}

export function defaultInquiryRecipient(cmsEmail?: string | null) {
  const configured = process.env.INQUIRY_TO_EMAIL?.trim();
  if (configured) return configured;
  if (cmsEmail?.trim()) return cmsEmail.trim();
  return "office@raularchitects.com";
}
