<script setup lang="ts">
const { locale } = useI18n();
const switchLocalePath = useSwitchLocalePath();
const route = useRoute();
const { profile, fetchProfile, updateLocalePreference } = useProfile();
const { refreshLocaleContext } = useLocaleContext();
const switching = ref(false);
const switchError = ref<string | null>(null);

// Cookie explizit mit path=/ setzen, damit die Wahl bei Reload/Tab-Wechsel erhalten bleibt (gleicher Key wie nuxt.config i18n.detectBrowserLanguage.cookieKey)
const localeCookie = useCookie<"en" | "de">("guildora_i18n", {
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
  sameSite: "lax"
});

async function onLocaleChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value as "en" | "de";
  if (value === locale.value || switching.value) {
    return;
  }

  switching.value = true;
  switchError.value = null;
  try {
    if (!profile.value) {
      await fetchProfile();
    }
    if (!profile.value) {
      throw createError({ statusCode: 401, statusMessage: "No profile session." });
    }

    const saved = await updateLocalePreference(value);
    const targetLocale = (saved.effectiveLocale === "de" || saved.effectiveLocale === "en") ? saved.effectiveLocale : value;
    await refreshLocaleContext();
    if (localeCookie.value !== targetLocale) {
      localeCookie.value = targetLocale;
    }
    const target = switchLocalePath(targetLocale);
    if (target && target !== route.fullPath) {
      await navigateTo(target);
    }
  } catch {
    switchError.value = "switchFailed";
  } finally {
    switching.value = false;
  }
}
</script>

<template>
  <UiSelect
    :key="locale"
    class="w-40"
    size="sm"
    :label="$t('language.label')"
    :model-value="locale"
    :disabled="switching"
    @change="onLocaleChange"
  >
    <option value="en">{{ $t("language.english") }}</option>
    <option value="de">{{ $t("language.german") }}</option>
  </UiSelect>
  <p v-if="switchError" class="text-xs text-error">{{ $t("language.switchError") }}</p>
</template>
