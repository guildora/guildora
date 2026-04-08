const UNSAFE_HREF_RE = /^\s*(javascript|vbscript|data)\s*:/i;

/**
 * Returns the href if it uses a safe scheme, otherwise "#".
 * Prevents javascript:/vbscript:/data: injection in user-provided links.
 */
export function safeLandingHref(raw: unknown): string {
  const href = typeof raw === "string" ? raw.trim() : "";
  if (!href || UNSAFE_HREF_RE.test(href)) return "#";
  return href;
}
