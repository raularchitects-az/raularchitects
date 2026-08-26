import { timingSafeEqual } from "node:crypto";
import { runAllSources } from "@/lib/radar/discovery";

/**
 * Scheduled discovery endpoint.
 *
 * Vercel Cron calls this with `Authorization: Bearer $CRON_SECRET` whenever the
 * CRON_SECRET environment variable is set, so the route is never public even
 * though it lives under /api. Without the secret configured the endpoint
 * refuses to run at all rather than falling back to an open trigger.
 */
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const HEADERS = { "X-Robots-Tag": "noindex, nofollow", "Cache-Control": "no-store" };

function secretMatches(provided: string, expected: string) {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function readProvidedSecret(request: Request) {
  const header = request.headers.get("authorization");
  if (header?.toLowerCase().startsWith("bearer ")) return header.slice(7).trim();
  return request.headers.get("x-radar-cron-secret")?.trim() ?? "";
}

export async function GET(request: Request) {
  const expected = process.env["CRON_SECRET"]?.trim();
  if (!expected) {
    return Response.json(
      { ok: false, error: "CRON_SECRET konfiqurasiya olunmayıb." },
      { status: 503, headers: HEADERS },
    );
  }

  const provided = readProvidedSecret(request);
  if (!provided || !secretMatches(provided, expected)) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401, headers: HEADERS });
  }

  // Every enabled official source runs in the same scheduled job.
  const result = await runAllSources({ trigger: "schedule" });
  return Response.json(
    { ok: result.status !== "failed", ...result },
    { status: result.status === "failed" ? 500 : 200, headers: HEADERS },
  );
}
