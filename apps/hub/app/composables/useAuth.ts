import { roleHierarchy } from "@guildora/shared/types/roles";

export function useAuth() {
  const { loggedIn, user, clear } = useUserSession();

  const hasRole = (role: string): boolean => {
    const roles = ((user.value as Record<string, unknown>)?.permissionRoles ?? (user.value as Record<string, unknown>)?.roles ?? []) as string[];
    return roles.some((r) => roleHierarchy[r]?.includes(role) ?? r === role);
  };

  const logout = async () => {
    await $fetch("/api/auth/logout", { method: "POST" });
    await clear();
    await navigateTo("/");
  };

  return {
    loggedIn,
    user,
    hasRole,
    logout
  };
}
