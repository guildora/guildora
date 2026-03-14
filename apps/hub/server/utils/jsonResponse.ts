/**
 * Recursively ensures a value is JSON-serializable (Dates → ISO string, BigInt → string).
 * Prevents "value.toISOString is not a function" when Nitro serializes (handles Date-like objects from DB/different realm).
 */
export function sanitizeForJson<T>(value: T): T {
  if (typeof value === "function") {
    // Drop functions entirely; JSON.stringify would ignore them but some built-ins (e.g. Date.prototype.toJSON) can throw when misbound.
    return undefined as T;
  }
  if (value === null || value === undefined) {
    return value;
  }
  if (typeof value !== "object") {
    if (typeof value === "bigint") return String(value) as T;
    return value;
  }
  if (typeof value === "object" && value !== null) {
    const toIso = (value as unknown as { toISOString?: () => string }).toISOString;
    if (typeof toIso === "function") {
      try {
        return (toIso.call(value) as string) as T;
      } catch {
        if (value instanceof Date) {
          try {
            return (value as Date).toISOString() as T;
          } catch {
            return null as T;
          }
        }
      }
    }
  }
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeForJson(item)).filter((v) => v !== undefined) as T;
  }
  if (typeof value === "object" && value !== null) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      if (typeof v === "function") {
        // Drop functions (e.g. stray toJSON) to avoid JSON.stringify invoking them (which can throw if misbound).
        continue;
      }
      out[k] = sanitizeForJson(v);
    }
    return out as T;
  }
  return null as T;
}

export function jsonResponse<T>(value: T): Response {
  return new Response(JSON.stringify(sanitizeForJson(value)), {
    headers: {
      "content-type": "application/json;charset=UTF-8"
    }
  });
}
