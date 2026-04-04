import { checkRateLimit, getRateLimitKey } from "../utils/rate-limit";

export default defineEventHandler((event) => {
  if (!event.path.startsWith("/api/")) return;

  const { remaining } = checkRateLimit(getRateLimitKey(event, "global"), {
    windowMs: 60_000,
    max: 300
  });

  setResponseHeader(event, "X-RateLimit-Limit", "300");
  setResponseHeader(event, "X-RateLimit-Remaining", String(remaining));
});
