/**
 * Discord OAuth callback is implemented in the Hub app (port 3003).
 * This route redirects requests that hit the Web app (port 3000) to the Hub
 * so that a misconfigured NUXT_OAUTH_DISCORD_REDIRECT_URI pointing to Web still works.
 */
export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event);
  const hubUrl = (config.public?.hubUrl as string)?.trim() || "http://localhost:3003";
  const query = getQuery(event);
  const target = new URL("/api/auth/discord", hubUrl);
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null) {
      target.searchParams.set(key, Array.isArray(value) ? value[0] : String(value));
    }
  }
  return sendRedirect(event, target.toString(), 302);
});
