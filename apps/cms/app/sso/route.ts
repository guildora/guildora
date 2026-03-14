import { NextResponse, type NextRequest } from "next/server";

export function GET(request: NextRequest) {
  const target = new URL("/api/sso", request.url);
  target.search = request.nextUrl.search;
  return NextResponse.redirect(target, 307);
}
