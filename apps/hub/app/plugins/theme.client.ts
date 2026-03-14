import {
  applyThemeColorsToDom,
  defaultThemeColors,
  type ThemeColors
} from "../../utils/theme-colors";

export default defineNuxtPlugin(() => {
  const themeColors = useState<ThemeColors>("theme-colors", () => ({ ...defaultThemeColors }));
  const colorMode = useColorMode();

  const applyTheme = () => {
    const mode = colorMode.value === "dark" ? "dark" : "light";
    applyThemeColorsToDom(themeColors.value, mode);
  };

  applyTheme();

  watch(
    () => [
      themeColors.value.colorDominant,
      themeColors.value.colorSecondary,
      themeColors.value.colorAccent,
      themeColors.value.colorAccentContentTone,
      themeColors.value.colorInfo,
      themeColors.value.colorInfoContentTone,
      themeColors.value.colorSuccess,
      themeColors.value.colorSuccessContentTone,
      themeColors.value.colorWarning,
      themeColors.value.colorWarningContentTone,
      themeColors.value.colorError,
      themeColors.value.colorErrorContentTone
    ],
    () => applyTheme()
  );

  watch(() => colorMode.value, () => applyTheme());
  watch(() => colorMode.preference, () => applyTheme());
});
