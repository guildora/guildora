export default defineEventHandler((event) => {
  const locale = getRouterParam(event, "locale");
  if (locale !== "de" && locale !== "en") {
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found."
    });
  }

  const query = getQuery(event);
  const requestUrl = getRequestURL(event);
  const target = new URL("/api/auth/discord", `${requestUrl.protocol}//${requestUrl.host}`);

  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null) {
      target.searchParams.set(key, Array.isArray(value) ? value[0] : String(value));
    }
  }

  return sendRedirect(event, target.toString(), 302);
});
