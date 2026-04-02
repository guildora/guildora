<script setup lang="ts">
const config = useRuntimeConfig();
const route = useRoute();
const { locale } = useI18n();
const { fetchLandingPage } = useLanding();
const landingPage = await fetchLandingPage(locale.value === "de" ? "de" : "en");

const isPreview = computed(() => route.query.preview === "true");

interface PreviewSection {
  id: string;
  blockType: string;
  sortOrder: number;
  config: Record<string, unknown>;
  content: Record<string, unknown>;
}

const previewSections = ref<PreviewSection[] | null>(null);
const previewCustomCss = ref<string | null>(null);

const activeSections = computed(() =>
  previewSections.value ?? landingPage?.sections ?? []
);

const activeCustomCss = computed(() =>
  previewCustomCss.value ?? landingPage?.customCss ?? null
);

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

onMounted(() => {
  if (!isPreview.value) return;

  window.addEventListener("message", (event) => {
    if (!event.data || typeof event.data !== "object") return;
    const msg = event.data as { type?: string; sections?: PreviewSection[]; customCss?: string | null };

    if (msg.type === "landing-preview-update") {
      if (msg.sections) previewSections.value = msg.sections;
      if (msg.customCss !== undefined) previewCustomCss.value = msg.customCss;
    }
  });
});
</script>

<template>
  <div :class="['space-y-6', isPreview && 'pointer-events-none select-none']">
    <div v-if="activeSections.length === 0" class="rounded-lg bg-blue-500/10 border border-blue-500/20 px-4 py-8 text-center">
      <span>{{ $t("landing.fallbackText") }}</span>
      <a v-if="!isPreview" :href="hubLoginUrl" class="block mt-3 font-semibold text-[var(--color-accent)]">{{ $t("nav.login") }}</a>
    </div>
    <template v-else>
      <LandingBlockRenderer
        v-for="section in activeSections"
        :key="section.id"
        :section="section"
      />
      <div v-if="!isPreview" class="pt-2">
        <a :href="hubLoginUrl" class="inline-block rounded-lg bg-[var(--color-accent,#7C3AED)] px-6 py-3 text-sm font-medium text-white hover:opacity-90 transition-opacity">{{ $t("nav.login") }}</a>
      </div>
    </template>

    <component v-if="activeCustomCss" :is="'style'" v-text="activeCustomCss" />
  </div>
</template>
