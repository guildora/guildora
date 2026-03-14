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
</script>

<template>
  <section class="flex h-full min-h-0 flex-col">
    <div
      v-if="pending || isForbidden || isNotConfigured || !hasEmbedUrl"
      class="mx-auto w-full max-w-[1700px] rounded-2xl border border-line/60 bg-base-100 p-4 shadow-neu-raised lg:p-6"
    >
      <div v-if="pending" class="flex min-h-[240px] items-center justify-center">
        <span class="loading loading-spinner loading-md" />
      </div>
      <div v-else-if="isForbidden" class="alert alert-warning">{{ $t("cmsPage.forbidden") }}</div>
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
      <iframe
        :src="embedUrl"
        :title="t('cmsPage.iframeTitle')"
        class="block h-full w-full"
        loading="lazy"
        referrerpolicy="no-referrer"
      />
      <div class="pointer-events-none absolute bottom-3 right-3">
        <button
          class="btn btn-sm btn-circle btn-outline pointer-events-auto"
          type="button"
          :aria-label="t('cmsPage.refreshSession')"
          :title="t('cmsPage.refreshSession')"
          @click="refresh()"
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
