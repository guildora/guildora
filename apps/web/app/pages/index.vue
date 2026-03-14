<script setup lang="ts">
const config = useRuntimeConfig();
const { locale } = useI18n();
const { fetchLandingPage } = usePayload();
const landingPage = await fetchLandingPage(locale.value === "de" ? "de" : "en");

const hubLoginUrl = computed(() => {
  const rawHubUrl = String(config.public.hubUrl || "").trim() || "http://localhost:3003";

  try {
    const endpoint = new URL("/login", rawHubUrl);
    endpoint.searchParams.set("returnTo", "/dashboard");
    return endpoint.toString();
  } catch {
    return "http://localhost:3003/login?returnTo=%2Fdashboard";
  }
});

if (landingPage?.seo?.title) {
  useSeoMeta({
    title: landingPage.seo.title,
    description: landingPage.seo.description,
    keywords: landingPage.seo.keywords
  });
}
</script>

<template>
  <div class="space-y-6">
    <div v-if="!landingPage" class="alert alert-info flex flex-col gap-3">
      <span>{{ $t("landing.fallbackText") }}</span>
      <a :href="hubLoginUrl" class="link link-primary font-semibold">{{ $t("nav.login") }}</a>
    </div>
    <template v-else>
      <CmsBlockRenderer v-for="(block, idx) in landingPage.layout || []" :key="idx" :block="block" />
      <div class="pt-2">
        <a :href="hubLoginUrl" class="btn btn-primary">{{ $t("nav.login") }}</a>
      </div>
    </template>
  </div>
</template>
