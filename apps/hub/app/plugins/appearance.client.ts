import { defaultAppearancePreference, normalizeAppearancePreference } from "../../utils/appearance";

type ProfilePreferencesResponse = {
  appearancePreference?: string | null;
};

export default defineNuxtPlugin(async () => {
  const colorMode = useColorMode();
  const appearancePreference = useState("appearance-preference", () => defaultAppearancePreference);

  try {
    const profile = await $fetch<ProfilePreferencesResponse>("/api/profile", {
      credentials: "include"
    });

    const nextAppearance = normalizeAppearancePreference(profile.appearancePreference, defaultAppearancePreference);
    appearancePreference.value = nextAppearance;
    colorMode.preference = nextAppearance;
  } catch {
    // Ignore missing session or profile fetch errors.
  }
});
