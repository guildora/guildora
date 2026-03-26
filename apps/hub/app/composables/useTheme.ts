export function useTheme() {
  const { resolvedMode } = useAppearance();
  const theme = computed(() => resolvedMode.value === "dark" ? "guildora-dark" : "guildora-light");

  const setTheme = () => {
    if (!import.meta.client) {
      return;
    }

    document.documentElement.setAttribute("data-theme", theme.value);
  };

  return {
    theme,
    setTheme
  };
}
