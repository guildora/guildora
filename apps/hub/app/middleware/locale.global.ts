import { normalizeLocalePreference } from "../../utils/locale-preference";

function getPathLocale(path: string): "en" | "de" {
  const firstSegment = path.split("/").filter(Boolean)[0];
  return firstSegment === "de" ? "de" : "en";
}

function withPathLocale(path: string, locale: "en" | "de"): string {
  const parts = path.split("/").filter(Boolean);
  const hasLocalePrefix = parts[0] === "de" || parts[0] === "en";
  const stripped = hasLocalePrefix ? parts.slice(1) : parts;

  if (locale === "en") {
    return stripped.length > 0 ? `/${stripped.join("/")}` : "/";
  }

  return stripped.length > 0 ? `/de/${stripped.join("/")}` : "/de";
}

export default defineNuxtRouteMiddleware(async (to) => {
  const { loggedIn } = useUserSession();
  const localeCookie = useCookie<"en" | "de">("newguildplus_i18n", {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax"
  });

  const { localeContext, refreshLocaleContext } = useLocaleContext();
  const needsContextRefresh = !localeContext.value
    || (loggedIn.value && !localeContext.value.hasSession)
    || (!loggedIn.value && localeContext.value.hasSession);
  if (needsContextRefresh) {
    await refreshLocaleContext();
  }

  const preferredLocale = normalizeLocalePreference(
    localeContext.value?.effectiveLocale ?? localeCookie.value ?? getPathLocale(to.path),
    "en"
  );

  if (localeCookie.value !== preferredLocale) {
    localeCookie.value = preferredLocale;
  }

  const currentPathLocale = getPathLocale(to.path);
  if (currentPathLocale === preferredLocale) {
    return;
  }

  const targetPath = withPathLocale(to.fullPath || to.path, preferredLocale);
  if (!targetPath || targetPath === to.fullPath) {
    return;
  }

  return navigateTo(targetPath);
});
