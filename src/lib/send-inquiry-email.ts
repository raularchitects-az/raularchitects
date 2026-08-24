import "server-only";

type InquiryPayload = {
  name: string;
  email: string;
  message: string;
  to: string;
  /** Set when the enquiry came from a project detail page. */
  project?: string;
  pageUrl?: string;
};

/** Bracket access so Next.js reads env at runtime on Vercel, not at build time. */
function env(name: string) {
  return process.env[name]?.trim();
}

function inquiryFromAddress() {
  return env("INQUIRY_FROM_EMAIL") || "Raul Architects <onboarding@resend.dev>";
}

export async function sendInquiryEmail(payload: InquiryPayload) {
  const apiKey = env("RESEND_API_KEY");
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
      subject: payload.project
        ? `Layihə müraciəti: ${payload.project} — ${payload.name}`
        : `Müraciət formu: ${payload.name}`,
      text: [
        `Ad: ${payload.name}`,
        `E-poçt: ${payload.email}`,
        ...(payload.project ? [`Layihə: ${payload.project}`] : []),
        ...(payload.pageUrl ? [`Səhifə: ${payload.pageUrl}`] : []),
        "",
        payload.message,
      ].join("\n"),
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Email göndərilmədi (${response.status}): ${detail || response.statusText}`);
  }
}

export function defaultInquiryRecipient(cmsEmail?: string | null) {
  const configured = env("INQUIRY_TO_EMAIL");
  if (configured) return configured;
  if (cmsEmail?.trim()) return cmsEmail.trim();
  return "office@raularchitects.com";
}
