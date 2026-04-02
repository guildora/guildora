<script setup lang="ts">
const config = useRuntimeConfig();
const { locale } = useI18n();
const { fetchLandingPage } = useLanding();
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

if (landingPage?.meta?.title) {
  useSeoMeta({
    title: landingPage.meta.title,
    description: landingPage.meta.description
  });
}
</script>

<template>
  <div class="space-y-6">
    <div v-if="!landingPage || landingPage.sections.length === 0" class="alert alert-info flex flex-col gap-3">
      <span>{{ $t("landing.fallbackText") }}</span>
      <a :href="hubLoginUrl" class="link link-primary font-semibold">{{ $t("nav.login") }}</a>
    </div>
    <template v-else>
      <LandingBlockRenderer
        v-for="section in landingPage.sections"
        :key="section.id"
        :section="section"
      />
      <div class="pt-2">
        <a :href="hubLoginUrl" class="btn btn-primary">{{ $t("nav.login") }}</a>
      </div>
    </template>

    <component v-if="landingPage?.customCss" :is="'style'" v-text="landingPage.customCss" />
  </div>
</template>
