import { tryCookieLocale, tryHeaderLocale } from "@intlify/h3";

export default defineI18nLocaleDetector((event, config) => {
  const cookie = tryCookieLocale(event, { name: "guildora_i18n", lang: "" });
  if (cookie) return cookie.toString();

  const header = tryHeaderLocale(event);
  if (header) return header.toString();

  return config.defaultLocale ?? "en";
});
