export const appearancePreferences = ["light", "dark", "system"] as const;

export type AppearancePreference = (typeof appearancePreferences)[number];
export type ResolvedAppearanceMode = "light" | "dark";

export const defaultAppearancePreference: AppearancePreference = "system";

const appearancePreferenceSet = new Set<string>(appearancePreferences);

export function normalizeAppearancePreference(
  value: unknown,
  fallback: AppearancePreference = defaultAppearancePreference
): AppearancePreference {
  if (typeof value !== "string") {
    return fallback;
  }

  const normalized = value.toLowerCase();
  return appearancePreferenceSet.has(normalized) ? (normalized as AppearancePreference) : fallback;
}

export function readAppearancePreferenceFromCustomFields(
  customFields: Record<string, unknown> | null | undefined,
  fallback: AppearancePreference = defaultAppearancePreference
): AppearancePreference {
  return normalizeAppearancePreference(customFields?.appearancePreference, fallback);
}

export function writeAppearancePreferenceToCustomFields(
  customFields: Record<string, unknown> | null | undefined,
  appearancePreference: AppearancePreference
): Record<string, unknown> {
  return {
    ...(customFields || {}),
    appearancePreference
  };
}
