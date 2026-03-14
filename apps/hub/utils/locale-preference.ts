export const localePreferences = ["en", "de"] as const;
export type LocalePreference = (typeof localePreferences)[number];
export type UserLocalePreference = LocalePreference | null;
export type CommunityDefaultLocale = LocalePreference;

export type LocaleResolutionSource = "user" | "community" | "system";

const localePreferenceSet = new Set<string>(localePreferences);

export function parseLocalePreference(value: unknown): LocalePreference | null {
  if (typeof value !== "string") {
    return null;
  }
  const normalized = value.toLowerCase();
  return localePreferenceSet.has(normalized) ? (normalized as LocalePreference) : null;
}

export function normalizeLocalePreference(
  value: unknown,
  fallback: LocalePreference = "en"
): LocalePreference {
  return parseLocalePreference(value) ?? fallback;
}

export function normalizeUserLocalePreference(
  value: unknown,
  fallback: UserLocalePreference = null
): UserLocalePreference {
  return parseLocalePreference(value) ?? fallback;
}

export function normalizeCommunityDefaultLocale(
  value: unknown,
  fallback: CommunityDefaultLocale = "en"
): CommunityDefaultLocale {
  return normalizeLocalePreference(value, fallback);
}

export function readLegacyLocalePreferenceFromCustomFields(
  customFields: Record<string, unknown> | null | undefined
): LocalePreference | null {
  return parseLocalePreference(customFields?.localePreference);
}

export function resolveEffectiveLocale(input: {
  userLocalePreference: UserLocalePreference;
  communityDefaultLocale: CommunityDefaultLocale;
  systemFallbackLocale?: LocalePreference;
}): { locale: LocalePreference; source: LocaleResolutionSource } {
  const userLocale = parseLocalePreference(input.userLocalePreference);
  if (userLocale) {
    return { locale: userLocale, source: "user" };
  }

  const communityLocale = parseLocalePreference(input.communityDefaultLocale);
  if (communityLocale) {
    return { locale: communityLocale, source: "community" };
  }

  return {
    locale: normalizeLocalePreference(input.systemFallbackLocale, "en"),
    source: "system"
  };
}
