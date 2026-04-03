export default defineNuxtRouteMiddleware(async () => {
  const { user, hasRole } = useAuth();

  if (!user.value) {
    return navigateTo("/login");
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
