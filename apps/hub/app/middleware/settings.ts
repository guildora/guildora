export default defineNuxtRouteMiddleware(async (to) => {
  const { user, hasRole } = useAuth();

  if (!user.value) {
    const returnTo = encodeURIComponent(to.fullPath || "/dashboard");
    return navigateTo(`/login?returnTo=${returnTo}`);
  }

  if (hasRole("admin")) {
    return;
  }

  if (hasRole("moderator")) {
    const moderationRights = (user.value as Record<string, unknown>)?.moderationRights as Record<string, boolean> | undefined;
    const hasAnyRight = moderationRights ? Object.values(moderationRights).some(Boolean) : false;
    if (hasAnyRight) {
      return;
    }
  }

  return navigateTo("/dashboard");
});
