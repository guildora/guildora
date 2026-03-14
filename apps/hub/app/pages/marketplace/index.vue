<script setup lang="ts">
definePageMeta({
  middleware: ["auth"],
});

const { t } = useI18n();
const runtimeConfig = useRuntimeConfig();
const embedUrl = computed(() => String(runtimeConfig.public.marketplaceEmbedUrl || "").trim());
const hasEmbedUrl = computed(() => Boolean(embedUrl.value));
const iframeRenderKey = ref(0);

const refreshMarketplaceEmbed = () => {
  iframeRenderKey.value += 1;
};
</script>

<template>
  <section class="flex h-full min-h-0 flex-col">
    <div
      v-if="!hasEmbedUrl"
      class="mx-auto w-full max-w-[1700px] rounded-2xl border border-line/60 bg-base-100 p-4 shadow-neu-raised lg:p-6"
    >
      <div class="alert alert-info">{{ $t("marketplacePage.notConfigured") }}</div>
    </div>
    <div
      v-else
      class="relative min-h-0 h-full w-full flex-1 overflow-hidden"
    >
      <iframe
        :key="iframeRenderKey"
        :src="embedUrl"
        :title="t('marketplacePage.iframeTitle')"
        class="block h-full w-full"
        loading="lazy"
        referrerpolicy="no-referrer"
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
