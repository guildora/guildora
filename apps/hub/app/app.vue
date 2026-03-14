<script setup lang="ts">
import {
  buildThemeHtmlStyle,
  defaultThemeColors,
  normalizeThemeColors,
  resolveThemeName,
  type ThemeColors
} from "../utils/theme-colors";

const themeColors = useState<ThemeColors>("theme-colors", () => ({ ...defaultThemeColors }));
const colorMode = useColorMode();
const { data } = await useFetch<ThemeColors>("/api/theme", {
  key: "initial-theme-colors",
  default: () => ({ ...defaultThemeColors })
});

themeColors.value = normalizeThemeColors(data.value);

const resolvedMode = computed(() => colorMode.value === "dark" ? "dark" : "light");

useHead({
  htmlAttrs: {
    "data-theme": computed(() => resolveThemeName(resolvedMode.value)),
    style: computed(() => buildThemeHtmlStyle(themeColors.value, resolvedMode.value))
  },
  bodyAttrs: {
    style: "margin:0;background-color:var(--color-base-100);color:var(--color-base-content);"
  }
});
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
