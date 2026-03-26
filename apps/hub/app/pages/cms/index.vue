<script setup lang="ts">
definePageMeta({
  middleware: ["auth"],
});

const { t } = useI18n();
const { data, error, pending, refresh } = await useFetch<{
  url: string;
  expiresAt: string;
}>("/api/cms/session-url", {
  server: true
});

const embedUrl = computed(() => String(data.value?.url || "").trim());
const hasEmbedUrl = computed(() => Boolean(embedUrl.value));
const isForbidden = computed(() => error.value?.statusCode === 403);
const isNotConfigured = computed(() => error.value?.statusCode === 503);

const allowedNotConfiguredMessages = [
  "CMS URL is not configured.",
  "CMS SSO is not configured.",
  "CMS URL is invalid."
];

const notConfiguredDetails = computed(() => {
  if (!isNotConfigured.value) {
    return "";
  }

  const statusMessage = typeof error.value?.statusMessage === "string" ? error.value.statusMessage.trim() : "";
  const dataStatusMessage =
    typeof (error.value as { data?: { statusMessage?: unknown } } | null)?.data?.statusMessage === "string"
      ? (error.value as { data?: { statusMessage?: string } } | null)?.data?.statusMessage?.trim() || ""
      : "";
  const candidate = statusMessage || dataStatusMessage;

  return allowedNotConfiguredMessages.includes(candidate) ? candidate : "";
});

const iframeLoaded = ref(false);

const onIframeLoad = () => {
  iframeLoaded.value = true;
};

const handleRefresh = () => {
  iframeLoaded.value = false;
  refresh();
};
</script>

<template>
  <section class="flex h-full min-h-0 flex-col">
    <div
      v-if="isForbidden || isNotConfigured || (!pending && !hasEmbedUrl)"
      class="mx-auto w-full max-w-[1700px] rounded-2xl border border-line/60 bg-base-100 p-4 shadow-md lg:p-6"
    >
      <div v-if="isForbidden" class="alert alert-warning">{{ $t("cmsPage.forbidden") }}</div>
      <div v-else-if="isNotConfigured" class="alert alert-info">
        <div>
          <p>{{ $t("cmsPage.notConfigured") }}</p>
          <p v-if="notConfiguredDetails" class="mt-1 text-xs opacity-80">{{ notConfiguredDetails }}</p>
        </div>
      </div>
      <div v-else class="alert alert-info">{{ $t("cmsPage.notConfigured") }}</div>
    </div>
    <div
      v-else
      class="relative min-h-0 h-full w-full flex-1 overflow-hidden"
    >
      <Transition name="iframe-fade">
        <div
          v-if="pending || !iframeLoaded"
          class="absolute inset-0 z-10 bg-base-100 flex flex-col items-center justify-center gap-4"
        >
          <span class="loading loading-spinner loading-lg text-primary" />
          <p class="text-sm text-base-content/50 tracking-wide">{{ $t("cmsPage.loading") }}</p>
        </div>
      </Transition>
      <iframe
        v-if="!pending && hasEmbedUrl"
        :src="embedUrl"
        :title="t('cmsPage.iframeTitle')"
        class="block h-full w-full"
        loading="lazy"
        referrerpolicy="no-referrer"
        @load="onIframeLoad"
      />
      <div class="pointer-events-none absolute bottom-3 right-3">
        <button
          class="btn btn-sm btn-circle btn-outline pointer-events-auto"
          type="button"
          :aria-label="t('cmsPage.refreshSession')"
          :title="t('cmsPage.refreshSession')"
          @click="handleRefresh"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M20 12a8 8 0 1 1-2.34-5.66M20 4v4h-4"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.iframe-fade-leave-active { transition: opacity 0.3s ease; }
.iframe-fade-leave-to { opacity: 0; }
</style>
