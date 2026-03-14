<script setup lang="ts">
import AppearanceSwitcher from "../../components/layout/AppearanceSwitcher.vue";
import LanguageSwitcher from "../../components/layout/LanguageSwitcher.vue";
import { defaultAppearancePreference, normalizeAppearancePreference, type AppearancePreference } from "../../../utils/appearance";
import type { EditableProfile } from "../../composables/useProfile";

definePageMeta({
  middleware: ["auth"],
});

const lastPath = useCookie<string | null>("newguild_profile_last_path", { sameSite: "lax" });
lastPath.value = "/profile/design";

const { fetchProfile, updateProfile } = useProfile();
const { t } = useI18n();
const toast = useState<string | null>("profile-toast", () => null);
const toastTimeout = ref<ReturnType<typeof setTimeout> | null>(null);

function showSavedToast() {
  if (toastTimeout.value) clearTimeout(toastTimeout.value);
  toast.value = "saved";
  toastTimeout.value = setTimeout(() => {
    toast.value = null;
    toastTimeout.value = null;
  }, 5000);
}

onBeforeRouteLeave(() => {
  toast.value = null;
  if (toastTimeout.value) {
    clearTimeout(toastTimeout.value);
    toastTimeout.value = null;
  }
});
const initial = (await fetchProfile()) || {
  profileName: "",
  ingameName: "",
  rufname: null,
  appearancePreference: defaultAppearancePreference,
  localePreference: null
};

const editable = ref<EditableProfile>({
  ...structuredClone(initial),
  appearancePreference: normalizeAppearancePreference(initial.appearancePreference, defaultAppearancePreference)
});

const saveError = ref<string | null>(null);
const saving = ref(false);

const saveDesign = async () => {
  saveError.value = null;
  saving.value = true;
  try {
    const data = await updateProfile({
      ...editable.value,
      appearancePreference: normalizeAppearancePreference(editable.value.appearancePreference, defaultAppearancePreference)
    });
    editable.value = {
      ...editable.value,
      ...data,
      appearancePreference: normalizeAppearancePreference(data.appearancePreference, defaultAppearancePreference)
    };
    showSavedToast();
  } catch (e: unknown) {
    const err = e as { statusCode?: number; statusMessage?: string; message?: string; data?: { message?: string } };
    console.error(err);
    saveError.value = t("common.error");
  } finally {
    saving.value = false;
  }
};
</script>

<template>
  <section class="space-y-6">
    <header class="space-y-2">
      <h1 class="text-2xl font-bold md:text-3xl">{{ $t("profile.designTitle") }}</h1>
    </header>

    <div v-if="toast === 'saved'" class="alert alert-success">
      {{ $t("profile.saveSuccess") }}
    </div>
    <div v-if="saveError" class="alert alert-error">
      {{ $t("common.error") }}: {{ saveError }}
    </div>

    <form class="space-y-4" @submit.prevent="saveDesign">
      <div class="flex max-w-sm flex-col gap-3">
        <LanguageSwitcher />
        <AppearanceSwitcher v-model="editable.appearancePreference" />
      </div>
      <div class="flex justify-end">
        <button class="btn btn-primary" type="submit" :disabled="saving">
          {{ saving ? $t("common.loading") : $t("common.save") }}
        </button>
      </div>
    </form>
  </section>
</template>
