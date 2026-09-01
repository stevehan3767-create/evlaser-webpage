import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { ADMIN_SESSION_COOKIE, isValidSessionToken } from "@/lib/auth";

const handleI18nRouting = createMiddleware(routing);

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }
    const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    if (!isValidSessionToken(token)) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  return handleI18nRouting(req);
}

export const config = {
  matcher: ["/admin/:path*", "/((?!api|_next|_vercel|.*\\..*).*)"],
};
