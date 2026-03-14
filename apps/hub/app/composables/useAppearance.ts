import {
  defaultAppearancePreference,
  normalizeAppearancePreference,
  type AppearancePreference,
  type ResolvedAppearanceMode
} from "../../utils/appearance";

export function useAppearance() {
  const colorMode = useColorMode();
  const preference = useState<AppearancePreference>("appearance-preference", () =>
    normalizeAppearancePreference(colorMode.preference, defaultAppearancePreference)
  );

  const resolvedMode = computed<ResolvedAppearanceMode>(() => {
    return colorMode.value === "dark" ? "dark" : "light";
  });

  const setPreference = (next: AppearancePreference) => {
    const normalized = normalizeAppearancePreference(next, defaultAppearancePreference);
    preference.value = normalized;
    colorMode.preference = normalized;
    return normalized;
  };

  const syncFromColorMode = () => {
    preference.value = normalizeAppearancePreference(colorMode.preference, defaultAppearancePreference);
    return preference.value;
  };

  return {
    preference,
    resolvedMode,
    setPreference,
    syncFromColorMode
  };
}
