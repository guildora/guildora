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
    const hasAccess = moderationRights?.allowModeratorAccess ?? false;
    if (hasAccess) {
      return;
    }
  }

  return navigateTo("/dashboard");
});
