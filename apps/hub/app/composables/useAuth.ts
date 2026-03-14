export function useAuth() {
  const { loggedIn, user, clear } = useUserSession();

  const logout = async () => {
    await $fetch("/api/auth/logout", { method: "POST" });
    await clear();
    await navigateTo("/");
  };

  return {
    loggedIn,
    user,
    logout
  };
}
