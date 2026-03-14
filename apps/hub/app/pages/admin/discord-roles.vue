<script setup lang="ts">
definePageMeta({
  middleware: ["admin"],
});

type GuildRole = {
  id: string;
  name: string;
  position: number;
  managed: boolean;
  editable: boolean;
};

type AdminDiscordRolesResponse = {
  guildRoles: GuildRole[];
  selectableRoleIds: string[];
  isSuperadmin: boolean;
};

type CommunitySettingsResponse = {
  communityName: string | null;
  defaultLocale: "en" | "de";
};

const { t } = useI18n();
const lastPath = useCookie<string | null>("newguild_admin_last_path", { sameSite: "lax" });
lastPath.value = "/admin/discord-roles";

const { data: communitySettingsData, refresh: refreshCommunitySettings } = await useFetch<CommunitySettingsResponse>(
  "/api/admin/community-settings",
  { key: "admin-community-settings" }
);
const communityNameInput = ref("");
const defaultLocaleInput = ref<"en" | "de">("en");
watch(
  () => communitySettingsData.value,
  (value) => {
    communityNameInput.value = value?.communityName ?? "";
    defaultLocaleInput.value = value?.defaultLocale === "de" ? "de" : "en";
  },
  { immediate: true }
);

const { data, pending, error, refresh } = await useFetch<AdminDiscordRolesResponse>("/api/admin/discord-roles");

const savePending = ref(false);
const communityNameSavePending = ref(false);
const selectedRoleIds = ref<string[]>([]);
const actionError = ref("");
const actionSuccess = ref("");

const editableRoleIdSet = computed(() => {
  const rows = data.value?.guildRoles || [];
  return new Set(rows.filter((role) => role.editable && !role.managed).map((role) => role.id));
});

const roles = computed(() => data.value?.guildRoles || []);
const selectableRoles = computed(() => roles.value.filter((role) => role.editable && !role.managed));
const selectedCount = computed(() => selectedRoleIds.value.filter((roleId) => editableRoleIdSet.value.has(roleId)).length);

watch(
  () => [data.value?.selectableRoleIds || [], data.value?.guildRoles || []] as const,
  ([selectableIds, guildRoles]) => {
    const roleById = new Map(guildRoles.map((role) => [role.id, role]));
    selectedRoleIds.value = Array.from(
      new Set(
        selectableIds.filter((roleId) => {
          const role = roleById.get(roleId);
          return Boolean(role && role.editable && !role.managed);
        })
      )
    );
  },
  { immediate: true }
);

const clearMessages = () => {
  actionError.value = "";
  actionSuccess.value = "";
};

const mapApiError = (error: unknown, fallbackKey: string) => {
  const err = error as {
    statusCode?: number;
    statusMessage?: string;
    message?: string;
    data?: { code?: string; message?: string };
  };

  const code = err?.data?.code;
  if (code === "UNAUTHORIZED") {
    return t("adminDiscordRoles.botErrors.unauthorized");
  }
  if (code === "MISSING_DISCORD_ID" || code === "MISSING_ROLE_ID" || code === "MISSING_ROLE_IDS") {
    return t("adminDiscordRoles.botErrors.missingPayload");
  }
  if (code === "INVALID_SELECTED_ROLE_IDS" || code === "NON_EDITABLE_ALLOWED_ROLES") {
    return t("adminDiscordRoles.botErrors.invalidRoleSelection");
  }
  if (code === "SYNC_FAILED") {
    return t("adminDiscordRoles.botErrors.syncFailed");
  }

  console.error(err);
  return t(fallbackKey);
};

const isRoleSelected = (roleId: string) => selectedRoleIds.value.includes(roleId);

const toggleRoleSelection = (roleId: string) => {
  if (!editableRoleIdSet.value.has(roleId)) {
    return;
  }

  if (isRoleSelected(roleId)) {
    selectedRoleIds.value = selectedRoleIds.value.filter((selectedRoleId) => selectedRoleId !== roleId);
    return;
  }

  selectedRoleIds.value = [...selectedRoleIds.value, roleId];
};

const saveSelectableRoles = async () => {
  clearMessages();
  savePending.value = true;
  try {
    const roleIds = selectedRoleIds.value.filter((roleId) => editableRoleIdSet.value.has(roleId));
    const result = await $fetch<{ selectableRoleIds: string[] }>("/api/admin/discord-roles", {
      method: "PUT",
      body: {
        discordRoleIds: roleIds
      }
    });
    selectedRoleIds.value = Array.from(new Set(result.selectableRoleIds));
    actionSuccess.value = t("adminDiscordRoles.saveSuccess");
    await refresh();
  } catch (err) {
    actionError.value = mapApiError(err, "adminDiscordRoles.saveError");
  } finally {
    savePending.value = false;
  }
};

const saveCommunityName = async () => {
  clearMessages();
  communityNameSavePending.value = true;
  try {
    await $fetch("/api/admin/community-settings", {
      method: "PUT",
      body: {
        communityName: communityNameInput.value.trim() || null,
        defaultLocale: defaultLocaleInput.value
      }
    });
    actionSuccess.value = t("adminDiscordRoles.communitySettingsSaveSuccess");
    await refreshCommunitySettings();
    await clearNuxtData("internal-branding");
  } catch (err) {
    actionError.value = mapApiError(err, "adminDiscordRoles.saveError");
  } finally {
    communityNameSavePending.value = false;
  }
};
</script>

<template>
  <section class="space-y-6">
    <header class="space-y-2">
      <h1 class="text-2xl font-bold md:text-3xl">{{ $t("adminDiscordRoles.title") }}</h1>
      <p class="opacity-80">{{ $t("adminDiscordRoles.description") }}</p>
    </header>

    <div v-if="actionError" class="alert alert-error">
      {{ actionError }}
    </div>
    <div v-if="actionSuccess" class="alert alert-success">
      {{ actionSuccess }}
    </div>

    <div class="card bg-base-200">
      <div class="card-body space-y-3">
        <h2 class="card-title">{{ $t("adminDiscordRoles.communityNameLabel") }}</h2>
        <p class="text-sm opacity-75">
          {{ $t("adminDiscordRoles.communityNameDescription") }}
        </p>
        <div class="flex flex-wrap items-start gap-x-2 gap-y-6 md:items-end">
          <UiRetroInput
            v-model="communityNameInput"
            class="w-full max-w-xl"
            :label="$t('adminDiscordRoles.communityNameLabel')"
            :placeholder="$t('adminDiscordRoles.communityNamePlaceholder')"
            :aria-label="$t('adminDiscordRoles.communityNameLabel')"
           
          />
          <UiRetroSelect
            v-model="defaultLocaleInput"
            class="w-full max-w-xs"
            :label="$t('adminDiscordRoles.defaultLocaleLabel')"
          >
            <option value="en">{{ $t("language.english") }}</option>
            <option value="de">{{ $t("language.german") }}</option>
          </UiRetroSelect>
          <button
            class="btn btn-primary btn-sm"
            :disabled="communityNameSavePending"
            type="button"
            @click="saveCommunityName"
          >
            {{ communityNameSavePending ? $t("common.loading") : $t("common.save") }}
          </button>
        </div>
      </div>
    </div>

    <div class="card bg-base-200">
      <div class="card-body space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h2 class="card-title">{{ $t("adminDiscordRoles.selectableTitle") }}</h2>
          <span class="badge badge-outline">{{ t("adminDiscordRoles.selectedCount", { count: selectedCount }) }}</span>
          <div class="flex flex-wrap gap-2 ms-auto">
            <button class="btn btn-outline btn-sm" :disabled="pending" type="button" @click="refresh">
              {{ $t("adminDiscordRoles.refresh") }}
            </button>
            <button
              class="btn btn-primary btn-sm"
              :disabled="pending || savePending"
              type="button"
              @click="saveSelectableRoles"
            >
              {{ savePending ? $t("common.loading") : $t("common.save") }}
            </button>
          </div>
        </div>

        <div v-if="pending" class="loading loading-spinner loading-md" />
        <div v-else-if="error" class="alert alert-error">{{ $t("adminDiscordRoles.loadError") }}</div>
        <div v-else-if="selectableRoles.length === 0" class="alert alert-info">{{ $t("adminDiscordRoles.empty") }}</div>
        <div v-else class="flex flex-wrap gap-2">
          <button
            v-for="role in selectableRoles"
            :key="role.id"
            class="btn justify-start"
            :class="isRoleSelected(role.id) ? 'btn-primary' : 'btn-secondary'"
            type="button"
            :aria-pressed="isRoleSelected(role.id)"
            @click="toggleRoleSelection(role.id)"
          >
            {{ role.name }}
          </button>
        </div>
        <p class="text-sm opacity-70">{{ $t("adminDiscordRoles.helperText") }}</p>
      </div>
    </div>
  </section>
</template>
