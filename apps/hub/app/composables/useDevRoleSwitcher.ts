type DevSwitcherUser = {
  id: string;
  discordId: string;
  profileName: string;
  communityRole: string | null;
  permissionRoles: string[];
};

type UserSessionShape = {
  originalUserId?: string;
};

type UserSessionUserShape = {
  permissionRoles?: string[];
  roles?: string[];
};

function isModeratorRole(roles: string[]) {
  return roles.includes("moderator") || roles.includes("admin") || roles.includes("superadmin");
}

export function useDevRoleSwitcher() {
  const runtimeConfig = useRuntimeConfig();
  const { user, session, fetch: fetchUserSession } = useUserSession();

  const users = ref<DevSwitcherUser[]>([]);
  const loadingUsers = ref(false);
  const switchingUserId = ref<string | null>(null);
  const restoring = ref(false);
  const error = ref<string | null>(null);

  const currentUser = computed(() => (user.value as UserSessionUserShape | null) || null);
  const currentRoles = computed(() => currentUser.value?.permissionRoles ?? currentUser.value?.roles ?? []);
  const currentSession = computed(() => (session.value as UserSessionShape | null) || null);
  const originalUserId = computed(() => currentSession.value?.originalUserId ?? null);

  const isDevEnabled = computed(() => import.meta.dev || Boolean(runtimeConfig.public.enablePerformanceDebug));
  const isAllowed = computed(() => isDevEnabled.value && (isModeratorRole(currentRoles.value) || Boolean(originalUserId.value)));

  const clearError = () => {
    error.value = null;
  };

  const fetchUsers = async () => {
    if (!isAllowed.value) {
      users.value = [];
      return;
    }

    loadingUsers.value = true;
    clearError();
    try {
      const response = await $fetch<{ items: DevSwitcherUser[] }>("/api/dev/users");
      users.value = response.items;
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : "Failed to load users.";
    } finally {
      loadingUsers.value = false;
    }
  };

  const switchUser = async (userId: string) => {
    switchingUserId.value = userId;
    clearError();
    try {
      await $fetch("/api/dev/switch-user", {
        method: "POST",
        body: { userId }
      });
      await fetchUserSession();
      await fetchUsers();
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : "Failed to switch user.";
    } finally {
      switchingUserId.value = null;
    }
  };

  const restoreUser = async () => {
    restoring.value = true;
    clearError();
    try {
      await $fetch("/api/dev/restore-user", { method: "POST" });
      await fetchUserSession();
      await fetchUsers();
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : "Failed to restore user.";
    } finally {
      restoring.value = false;
    }
  };

  return {
    users,
    loadingUsers,
    switchingUserId,
    restoring,
    error,
    isDevEnabled,
    isAllowed,
    originalUserId,
    fetchUsers,
    switchUser,
    restoreUser,
    clearError
  };
}
