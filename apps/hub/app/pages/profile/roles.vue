<script setup lang="ts">
definePageMeta({
  middleware: ["auth"],
});

const lastPath = useCookie<string | null>("guildora_profile_last_path", { sameSite: "lax" });
lastPath.value = "/profile/roles";

const { fetchProfile, updateProfileDiscordRoles } = useProfile();
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
const initial = await fetchProfile();

const editableDiscordRoles = ref(
  (initial?.editableDiscordRoles || []).map((role) => ({
    ...role
  }))
);
const selectedDiscordRoleIds = ref(
  editableDiscordRoles.value.filter((role) => role.selected).map((role) => role.discordRoleId)
);
const roleSaveError = ref<string | null>(null);
const saving = ref(false);

const toggleDiscordRole = (discordRoleId: string) => {
  const idx = selectedDiscordRoleIds.value.indexOf(discordRoleId);
  if (idx === -1) {
    selectedDiscordRoleIds.value = [...selectedDiscordRoleIds.value, discordRoleId];
  } else {
    selectedDiscordRoleIds.value = selectedDiscordRoleIds.value.filter((id) => id !== discordRoleId);
  }
};

const onSaveDiscordRoles = async () => {
  roleSaveError.value = null;
  saving.value = true;
  try {
    const data = await updateProfileDiscordRoles(selectedDiscordRoleIds.value);
    editableDiscordRoles.value = data.editableDiscordRoles;
    selectedDiscordRoleIds.value = data.editableDiscordRoles
      .filter((role) => role.selected)
      .map((role) => role.discordRoleId);
    showSavedToast();
  } catch (e: unknown) {
    const err = e as {
      statusCode?: number;
      statusMessage?: string;
      message?: string;
      data?: { code?: string; message?: string };
    };

    const code = err?.data?.code;
    if (code === "UNAUTHORIZED") {
      roleSaveError.value = t("profile.botErrors.unauthorized");
    } else if (code === "MISSING_DISCORD_ID") {
      roleSaveError.value = t("profile.botErrors.missingDiscordId");
    } else if (code === "INVALID_SELECTED_ROLE_IDS" || code === "NON_EDITABLE_ALLOWED_ROLES" || code === "MISSING_ROLE_IDS") {
      roleSaveError.value = t("profile.botErrors.invalidRoleSelection");
    } else if (code === "SYNC_FAILED") {
      roleSaveError.value = t("profile.botErrors.syncFailed");
    } else {
      console.error(err);
      roleSaveError.value = t("common.error");
    }
  } finally {
    saving.value = false;
  }
};
</script>

<template>
  <section class="space-y-6">
    <header class="space-y-2">
      <h1 class="text-2xl font-bold md:text-3xl">{{ $t("profile.rolesTitle") }}</h1>
    </header>

    <div v-if="toast === 'saved'" class="alert alert-success">
      {{ $t("profile.saveSuccess") }}
    </div>

    <div class="space-y-4">
      <p v-if="$t('profile.selectableDiscordRolesDescription')" class="text-sm opacity-75">
        {{ $t("profile.selectableDiscordRolesDescription") }}
      </p>
      <div v-if="roleSaveError" class="alert alert-error">
        {{ $t("common.error") }}: {{ roleSaveError }}
      </div>
      <div v-if="editableDiscordRoles.length === 0" class="alert alert-info">
        {{ $t("profile.noSelectableDiscordRoles") }}
      </div>
      <div v-else class="flex flex-wrap gap-2">
        <button
          v-for="role in editableDiscordRoles"
          :key="role.discordRoleId"
          type="button"
          class="btn justify-start"
          :class="selectedDiscordRoleIds.includes(role.discordRoleId) ? 'btn-primary' : 'btn-secondary'"
          :aria-pressed="selectedDiscordRoleIds.includes(role.discordRoleId)"
          @click="toggleDiscordRole(role.discordRoleId)"
        >
          {{ role.name }}
        </button>
      </div>
      <div class="flex justify-end">
        <button class="btn btn-primary" type="button" :disabled="saving" @click="onSaveDiscordRoles">
          {{ saving ? $t("common.loading") : $t("profile.saveDiscordRoles") }}
        </button>
      </div>
    </div>
  </section>
</template>
