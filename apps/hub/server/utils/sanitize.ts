import DOMPurify from "isomorphic-dompurify";

// --- CSS Sanitization ---

const CSS_DANGEROUS_PATTERNS = [
  /expression\s*\(/gi,
  /javascript\s*:/gi,
  /vbscript\s*:/gi,
  /-moz-binding\s*:/gi,
  /behavior\s*:/gi,
  /<\/?script/gi,
  /url\s*\(\s*["']?\s*data\s*:\s*text\/html/gi,
  /@import\b/gi,
  /url\s*\(\s*["']?\s*https?:/gi,
];

/**
 * Sanitize custom CSS by stripping dangerous patterns that can lead to XSS.
 * Removes expression(), javascript:/vbscript: URLs, -moz-binding, behavior, and script tags.
 */
export function sanitizeCss(css: string): string {
  let sanitized = css;
  for (const pattern of CSS_DANGEROUS_PATTERNS) {
    sanitized = sanitized.replace(pattern, "/* blocked */");
  }
  return sanitized;
}

// --- HTML Sanitization ---

/**
 * Sanitize an HTML string using DOMPurify.
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html);
}

/**
 * Sanitize all string values in a locale→string record (e.g. footer page content/title).
 */
export function sanitizeRecordStrings(
  record: Record<string, string>
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(record)) {
    result[key] = sanitizeHtml(value);
  }
  return result;
}

/**
 * Recursively sanitize all string values in an unknown content object.
 * Non-string primitives, arrays, and nested objects are traversed; strings are sanitized.
 */
export function sanitizeContentObject(
  obj: Record<string, unknown>
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = sanitizeUnknown(value);
  }
  return result;
}

function sanitizeUnknown(value: unknown): unknown {
  if (typeof value === "string") {
    return sanitizeHtml(value);
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeUnknown);
  }
  if (value !== null && typeof value === "object") {
    return sanitizeContentObject(value as Record<string, unknown>);
  }
  return value;
}
