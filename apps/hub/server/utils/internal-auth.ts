import type { H3Event } from "h3";

export function requireInternalToken(event: H3Event): void {
  const config = useRuntimeConfig(event);
  const expectedToken = String(config.mcpInternalToken || "").trim();

  if (!expectedToken) {
    throw createError({ statusCode: 503, statusMessage: "MCP internal token is not configured." });
  }

  const authHeader = getHeader(event, "authorization") || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : getHeader(event, "x-internal-token")?.trim() || "";

  if (!token || token !== expectedToken) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized." });
  }
}
