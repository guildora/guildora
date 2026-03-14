export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn } = useUserSession();
  if (!loggedIn.value) {
    const returnTo = encodeURIComponent(to.fullPath || "/dashboard");
    if (import.meta.dev) {
      return navigateTo(`/api/auth/discord?returnTo=${returnTo}`, { external: true });
    }
    return navigateTo(`/login?returnTo=${returnTo}`);
  }
});
