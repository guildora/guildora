import { NextResponse, type NextRequest } from "next/server";

function resolveAllowedAncestor() {
  const isProduction = process.env.NODE_ENV === "production";
  const devFallbacks = isProduction ? [] : ["http://localhost:3003", "http://localhost:3000"];
  const candidates = [process.env.NUXT_PUBLIC_HUB_URL, process.env.NUXT_PUBLIC_APP_URL, ...devFallbacks].filter(
    Boolean
  ) as string[];
  const origins = candidates
    .map((value) => {
      try {
        return new URL(value).origin;
      } catch {
        return null;
      }
    })
    .filter((value): value is string => Boolean(value));

  return Array.from(new Set(origins));
}

export function middleware(_request: NextRequest) {
  const response = NextResponse.next();
  const allowedAncestors = resolveAllowedAncestor();
  const ancestors = allowedAncestors.length > 0 ? `'self' ${allowedAncestors.join(" ")}` : "'self'";

  response.headers.set("Content-Security-Policy", `frame-ancestors ${ancestors}`);
  response.headers.delete("X-Frame-Options");

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/sso", "/sso"]
};
