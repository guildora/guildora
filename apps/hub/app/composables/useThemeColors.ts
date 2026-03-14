import {
  applyThemeColorsToDom,
  defaultThemeColors,
  normalizeThemeColors,
  type ThemeColors
} from "../../utils/theme-colors";

export type { ThemeColors } from "../../utils/theme-colors";
export { defaultThemeColors, normalizeThemeColors } from "../../utils/theme-colors";

export function useThemeColors() {
  const themeColors = useState<ThemeColors>("theme-colors", () => ({ ...defaultThemeColors }));
  const { resolvedMode } = useAppearance();

  const setThemeColors = (colors: Partial<ThemeColors>) => {
    const normalized = normalizeThemeColors(colors);
    themeColors.value = normalized;
    applyThemeColorsToDom(normalized, resolvedMode.value);
    return normalized;
  };

  const resetThemeColors = () => setThemeColors(defaultThemeColors);

  const loadThemeColors = async () => {
    try {
      const data = await $fetch<ThemeColors>("/api/theme");
      return setThemeColors(data);
    } catch {
      return setThemeColors(themeColors.value);
    }
  };

  return {
    themeColors,
    loadThemeColors,
    setThemeColors,
    resetThemeColors
  };
}
