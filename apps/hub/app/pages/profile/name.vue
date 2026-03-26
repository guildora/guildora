<script setup lang="ts">
import type { EditableProfile } from "../../composables/useProfile";

definePageMeta({
  middleware: ["auth"],
});

const lastPath = useCookie<string | null>("guildora_profile_last_path", { sameSite: "lax" });
lastPath.value = "/profile/name";

const { fetchProfile, updateProfile } = useProfile();
const toast = useState<string | null>("profile-toast", () => null);
const { t } = useI18n();
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
  rufname: null
};

const editable = ref<EditableProfile>({
  ...structuredClone(initial)
});
const saveError = ref<string | null>(null);
const discordSyncWarningKey = ref<string | null>(null);

function getDiscordSyncWarningKey(profile: EditableProfile) {
  const sync = profile.discordSync;
  if (!sync || sync.nicknameUpdated) {
    return null;
  }
  if (sync.nicknameReason === "missing_permissions") {
    return "profile.discordSyncWarning.missingPermissions";
  }
  if (sync.nicknameReason === "member_not_manageable") {
    return "profile.discordSyncWarning.memberNotManageable";
  }
  if (sync.nicknameReason === "nickname_too_long") {
    return "profile.discordSyncWarning.nicknameTooLong";
  }
  return "profile.discordSyncWarning.generic";
}

const onSubmit = async () => {
  saveError.value = null;
  discordSyncWarningKey.value = null;
  try {
    const data = await updateProfile(editable.value);
    editable.value = {
      ...editable.value,
      ...data
    };
    discordSyncWarningKey.value = getDiscordSyncWarningKey(editable.value);
    showSavedToast();
  } catch (e: unknown) {
    const err = e as { statusCode?: number; statusMessage?: string; message?: string; data?: { message?: string } };
    console.error(err);
    saveError.value = t("common.error");
  }
};
</script>

<template>
  <section class="space-y-6">
    <header class="space-y-2">
      <h1 class="text-2xl font-bold md:text-3xl">{{ $t("profile.nameTitle") }}</h1>
    </header>

    <div v-if="toast === 'saved'" class="alert alert-success">
      {{ $t("profile.saveSuccess") }}
    </div>
    <div v-if="saveError" class="alert alert-error">
      {{ $t("common.error") }}: {{ saveError }}
    </div>
    <div v-if="discordSyncWarningKey" class="alert alert-warning">
      {{ t(discordSyncWarningKey) }}
    </div>

    <ProfileEditor v-model="editable" :show-title="false" @submit="onSubmit" />
  </section>
</template>
