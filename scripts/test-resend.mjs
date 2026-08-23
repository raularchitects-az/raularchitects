import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvLocal();

const key = process.env.RESEND_API_KEY?.trim();
const to = process.env.INQUIRY_TO_EMAIL?.trim() || "office@raularchitects.com";
const from = process.env.INQUIRY_FROM_EMAIL?.trim() || "Raul Architects <noreply@raularchitects.com>";

if (!key) {
  console.error("FAIL: RESEND_API_KEY tapılmadı");
  process.exit(1);
}

const response = await fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    from,
    to: [to],
    subject: "Raul test — müraciət formu",
    text: "Bu test emailidir. Form işləyir.",
  }),
});

const body = await response.text();
if (!response.ok) {
  console.error(`FAIL: HTTP ${response.status}`);
  console.error(body.slice(0, 400));
  process.exit(1);
}

console.log(`OK: test email göndərildi → ${to}`);
