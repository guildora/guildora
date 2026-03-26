<script setup lang="ts">
type SessionUserShape = {
  id: string;
  profileName?: string;
  communityRole?: string | null;
  permissionRoles?: string[];
  roles?: string[];
};

const { t } = useI18n();
const { user } = useUserSession();
const isOpen = useState<boolean>("dev-role-switcher-open", () => false);
const search = ref("");
const selectedPermissionRole = ref("ALL");
const selectedCommunityRole = ref("ALL");

const {
  users,
  loadingUsers,
  switchingUserId,
  restoring,
  error,
  isAllowed,
  originalUserId,
  fetchUsers,
  switchUser,
  restoreUser
} = useDevRoleSwitcher();

const currentUser = computed(() => (user.value as SessionUserShape | null) || null);
const currentPermissionRoles = computed(() => currentUser.value?.permissionRoles ?? currentUser.value?.roles ?? []);

const permissionRoleOptions = computed(() => {
  const roles = new Set<string>();
  for (const item of users.value) {
    for (const role of item.permissionRoles) {
      roles.add(role);
    }
  }
  return ["ALL", ...Array.from(roles).sort((a, b) => a.localeCompare(b))];
});

const communityRoleOptions = computed(() => {
  const roles = new Set<string>();
  for (const item of users.value) {
    if (item.communityRole) {
      roles.add(item.communityRole);
    }
  }
  return ["ALL", ...Array.from(roles).sort((a, b) => a.localeCompare(b))];
});

const filteredUsers = computed(() => {
  const term = search.value.trim().toLowerCase();
  return users.value.filter((entry) => {
    const matchesSearch = term.length === 0
      || entry.profileName.toLowerCase().includes(term)
      || entry.id.toLowerCase().includes(term)
      || entry.discordId.toLowerCase().includes(term);
    const matchesPermissionRole = selectedPermissionRole.value === "ALL"
      || entry.permissionRoles.includes(selectedPermissionRole.value);
    const matchesCommunityRole = selectedCommunityRole.value === "ALL"
      || entry.communityRole === selectedCommunityRole.value;
    return matchesSearch && matchesPermissionRole && matchesCommunityRole;
  });
});

watch(isOpen, async (open) => {
  if (open) {
    await fetchUsers();
  }
});
</script>

<template>
  <div v-if="isAllowed">
    <button
      type="button"
      class="btn btn-primary btn-sm fixed bottom-4 right-4 z-40 shadow-md"
      @click="isOpen = true"
    >
      {{ $t("devRoleSwitcher.trigger") }}
    </button>

    <Teleport to="body">
      <Transition name="dev-switcher-fade">
        <div
          v-if="isOpen"
          class="fixed inset-0 z-[120] bg-black/55 backdrop-blur-sm p-4 md:p-6"
          @click.self="isOpen = false"
        >
          <div class="mx-auto flex h-full max-w-4xl flex-col rounded-2xl bg-surface-2 shadow-lg">
            <header class="flex items-start justify-between border-b border-line px-5 py-4">
              <div>
                <h2 class="text-lg font-semibold">{{ t("devRoleSwitcher.title") }}</h2>
                <p class="text-xs text-base-content/70">{{ t("devRoleSwitcher.description") }}</p>
              </div>
              <button type="button" class="btn btn-ghost btn-sm btn-circle" @click="isOpen = false">
                <span class="sr-only">{{ t("common.close") }}</span>
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                </svg>
              </button>
            </header>

            <div class="border-b border-line px-5 py-4 text-sm">
              <p class="font-medium">{{ currentUser?.profileName || "-" }}</p>
              <p class="text-xs text-base-content/70">{{ currentPermissionRoles.join(", ") || "-" }}</p>
              <p v-if="originalUserId" class="mt-2 text-xs text-info">{{ t("devRoleSwitcher.originalUser", { id: originalUserId }) }}</p>
            </div>

            <div class="grid gap-2 border-b border-line px-5 py-4 md:grid-cols-3">
              <UiInput
                v-model="search"
                size="sm"
                :label="t('devRoleSwitcher.searchPlaceholder')"
                :placeholder="t('devRoleSwitcher.searchPlaceholder')"
               
                type="search"
              />
              <UiSelect
                v-model="selectedPermissionRole"
                size="sm"
                :label="t('devRoleSwitcher.allPermissionRoles')"
               
              >
                <option v-for="role in permissionRoleOptions" :key="role" :value="role">
                  {{ role === "ALL" ? t("devRoleSwitcher.allPermissionRoles") : role }}
                </option>
              </UiSelect>
              <UiSelect
                v-model="selectedCommunityRole"
                size="sm"
                :label="t('devRoleSwitcher.allCommunityRoles')"
               
              >
                <option v-for="role in communityRoleOptions" :key="role" :value="role">
                  {{ role === "ALL" ? t("devRoleSwitcher.allCommunityRoles") : role }}
                </option>
              </UiSelect>
              <button
                type="button"
                class="btn btn-outline btn-sm"
                :disabled="!originalUserId || restoring"
                @click="restoreUser"
              >
                {{ restoring ? t("common.loading") : t("devRoleSwitcher.restoreButton") }}
              </button>
            </div>

            <div class="min-h-0 flex-1 overflow-auto px-5 py-4">
              <p v-if="error" class="alert alert-error mb-3 text-sm">{{ error }}</p>
              <p v-if="loadingUsers" class="text-sm text-base-content/70">{{ t("common.loading") }}</p>
              <p v-else-if="filteredUsers.length === 0" class="text-sm text-base-content/70">{{ t("devRoleSwitcher.noUsers") }}</p>

              <ul v-else class="space-y-2">
                <li
                  v-for="entry in filteredUsers"
                  :key="entry.id"
                  class="rounded-xl bg-base-100 px-4 py-3"
                >
                  <div class="flex flex-wrap items-center justify-between gap-3">
                    <div class="min-w-0">
                      <p class="truncate text-sm font-medium">{{ entry.profileName }}</p>
                      <p class="truncate text-xs text-base-content/70">{{ entry.id }}</p>
                      <p class="truncate text-xs text-base-content/70">{{ entry.discordId }}</p>
                      <p class="truncate text-xs text-base-content/70">
                        {{ entry.communityRole || "-" }} | {{ entry.permissionRoles.join(", ") || "-" }}
                      </p>
                    </div>
                    <button
                      type="button"
                      class="btn btn-primary btn-sm"
                      :disabled="switchingUserId === entry.id || currentUser?.id === entry.id"
                      @click="switchUser(entry.id)"
                    >
                      {{ switchingUserId === entry.id ? t("common.loading") : t("devRoleSwitcher.switchButton") }}
                    </button>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.dev-switcher-fade-enter-active,
.dev-switcher-fade-leave-active {
  transition: opacity 0.2s ease;
}

.dev-switcher-fade-enter-from,
.dev-switcher-fade-leave-to {
  opacity: 0;
}
</style>
