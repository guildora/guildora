<script setup lang="ts">
const { locale } = useI18n();
const { fetchFooterPages } = useFooterPages();

const { data: footerPages } = await useAsyncData("footer-pages", () =>
  fetchFooterPages(locale.value === "de" ? "de" : "en")
);
</script>

<template>
  <footer class="mt-16 bg-surface-2 py-10 md:mt-24">
    <div class="mx-auto max-w-[1400px] px-6 md:px-8">
      <div class="flex flex-col items-center gap-6 md:flex-row md:justify-between">
        <div class="text-center md:text-left">
          <p class="text-sm font-semibold tracking-wide">Guildora</p>
          <p class="mt-1 text-xs text-[var(--color-text-secondary)]">{{ $t("footer.tagline") }}</p>
        </div>
        <nav class="flex gap-6 text-xs text-[var(--color-text-secondary)]">
          <template v-if="footerPages && footerPages.length > 0">
            <NuxtLink
              v-for="page in footerPages"
              :key="page.slug"
              :to="'/' + page.slug"
              class="transition-colors hover:text-[var(--color-text-primary)]"
            >
              {{ page.title }}
            </NuxtLink>
          </template>
          <template v-else>
            <a href="/privacy" class="transition-colors hover:text-[var(--color-text-primary)]">{{ $t("footer.privacy") }}</a>
            <a href="/terms" class="transition-colors hover:text-[var(--color-text-primary)]">{{ $t("footer.terms") }}</a>
            <a href="/imprint" class="transition-colors hover:text-[var(--color-text-primary)]">{{ $t("footer.imprint") }}</a>
          </template>
        </nav>
      </div>
      <div class="mt-8 border-t border-[var(--color-line)] pt-6 text-center text-xs text-[var(--color-text-secondary)]">
        <p>&copy; {{ new Date().getFullYear() }} Guildora. {{ $t("footer.rights") }}</p>
        <p class="mt-1" style="opacity: 0.5;">{{ $t("footer.aiDisclosure") }}</p>
      </div>
    </div>
  </footer>
</template>
