<script setup lang="ts">
definePageMeta({
  middleware: ["auth"],
});

const { t } = useI18n();
const runtimeConfig = useRuntimeConfig();
const embedUrl = computed(() => String(runtimeConfig.public.marketplaceEmbedUrl || "").trim());
const hasEmbedUrl = computed(() => Boolean(embedUrl.value));
const iframeRenderKey = ref(0);
const iframeLoaded = ref(false);

const refreshMarketplaceEmbed = () => {
  iframeLoaded.value = false;
  iframeRenderKey.value += 1;
};

const onIframeLoad = () => {
  iframeLoaded.value = true;
};
</script>

<template>
  <section class="flex h-full min-h-0 flex-col">
    <div
      v-if="!hasEmbedUrl"
      class="mx-auto w-full max-w-[1700px] rounded-2xl border border-line/60 bg-base-100 p-4 shadow-md lg:p-6"
    >
      <div class="alert alert-info">{{ $t("marketplacePage.notConfigured") }}</div>
    </div>
    <div
      v-else
      class="relative min-h-0 h-full w-full flex-1 overflow-hidden"
    >
      <Transition name="iframe-fade">
        <div
          v-if="!iframeLoaded"
          class="absolute inset-0 z-10 bg-base-100 flex flex-col items-center justify-center gap-4"
        >
          <span class="loading loading-spinner loading-lg text-primary" />
          <p class="text-sm text-base-content/50 tracking-wide">{{ $t("marketplacePage.loading") }}</p>
        </div>
      </Transition>
      <iframe
        :key="iframeRenderKey"
        :src="embedUrl"
        :title="t('marketplacePage.iframeTitle')"
        class="block h-full w-full"
        loading="lazy"
        referrerpolicy="no-referrer"
        @load="onIframeLoad"
      />
      <div class="pointer-events-none absolute bottom-3 right-3">
        <button
          class="btn btn-sm btn-circle btn-outline pointer-events-auto"
          type="button"
          :aria-label="t('marketplacePage.refreshEmbed')"
          :title="t('marketplacePage.refreshEmbed')"
          @click="refreshMarketplaceEmbed"
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
