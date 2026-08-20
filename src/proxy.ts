import createIntlMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { protectAdmin } from "./lib/cms/protect-admin";
import { englishLegacyPathname } from "./lib/public-paths";

const intlMiddleware = createIntlMiddleware(routing);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    return protectAdmin(request);
  }

  const englishTarget = englishLegacyPathname(pathname);
  if (englishTarget && englishTarget !== pathname) {
    const url = request.nextUrl.clone();
    url.pathname = englishTarget;
    return NextResponse.redirect(url, 308);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!_next|_vercel|.*\\..*).*)"],
};
