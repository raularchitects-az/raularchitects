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

const key = process.env.DEEPL_API_KEY?.trim();
if (!key) {
  console.error("FAIL: DEEPL_API_KEY tapılmadı (.env.local)");
  process.exit(1);
}

const base = key.endsWith(":fx") ? "https://api-free.deepl.com" : "https://api.deepl.com";
const params = new URLSearchParams();
params.append("text", "Salam, bu testdir.");
params.set("source_lang", "AZ");
params.set("target_lang", "EN");

const response = await fetch(`${base}/v2/translate`, {
  method: "POST",
  headers: {
    Authorization: `DeepL-Auth-Key ${key}`,
    "Content-Type": "application/x-www-form-urlencoded",
  },
  body: params.toString(),
});

const body = await response.text();
if (!response.ok) {
  console.error(`FAIL: DeepL HTTP ${response.status}`);
  console.error(body.slice(0, 300));
  process.exit(1);
}

const json = JSON.parse(body);
const translated = json.translations?.[0]?.text;
console.log("OK: DeepL is working");
console.log(`AZ → EN sample: ${translated}`);
