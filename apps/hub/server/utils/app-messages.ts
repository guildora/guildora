export function resolveAppLocaleMessages(
  codeBundle: Record<string, string>,
  locale: "de" | "en"
): Record<string, unknown> {
  const candidates = locale === "en" ? ["src/i18n/en.json"] : [`src/i18n/${locale}.json`, "src/i18n/en.json"];

  for (const key of candidates) {
    const source = codeBundle[key];
    if (!source) continue;
    try {
      const parsed = JSON.parse(source) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
      return {};
    } catch {
      throw createError({ statusCode: 500, statusMessage: `Invalid app locale bundle '${key}'.` });
    }
  }

  return {};
}
