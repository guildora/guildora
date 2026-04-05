import { randomBytes, timingSafeEqual } from "node:crypto";
import { getHeader, createError, type H3Event } from "h3";

export const CSRF_HEADER = "x-csrf-token";

export function generateCsrfToken(): string {
  return randomBytes(32).toString("hex");
}

export function validateCsrfToken(event: H3Event, sessionToken: string): void {
  const header = getHeader(event, CSRF_HEADER);

  if (!header) {
    throw createError({ statusCode: 403, statusMessage: "CSRF token missing" });
  }

  const sessionBuf = Buffer.from(sessionToken);
  const headerBuf = Buffer.from(header);

  if (
    sessionBuf.length !== headerBuf.length ||
    !timingSafeEqual(sessionBuf, headerBuf)
  ) {
    throw createError({ statusCode: 403, statusMessage: "CSRF token invalid" });
  }
}
