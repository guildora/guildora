<script setup lang="ts">
defineProps<{
  content: Record<string, unknown>;
  config: Record<string, unknown>;
}>();
</script>

<template>
  <section class="relative overflow-hidden rounded-2xl bg-base-200 shadow-md">
    <img
      v-if="content.backgroundImage"
      :src="String(content.backgroundImage)"
      alt=""
      class="absolute inset-0 h-full w-full object-cover opacity-20"
    />
    <div class="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-transparent pointer-events-none" />
    <div class="relative flex min-h-[56vh] flex-col items-center justify-center px-6 py-16 text-center md:py-24">
      <span
        v-if="content.eyebrowLabel"
        class="mb-5 inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent"
      >
        {{ content.eyebrowLabel }}
      </span>
      <h1 class="mb-4 text-4xl font-extrabold leading-tight tracking-tight md:text-6xl lg:text-7xl">
        {{ content.heading }}
      </h1>
      <p class="mb-8 max-w-2xl text-base opacity-70 md:text-lg">{{ content.subheading }}</p>
      <div class="flex flex-wrap items-center justify-center gap-3">
        <a v-if="content.ctaLink" :href="String(content.ctaLink)" class="btn btn-primary btn-lg">
          {{ content.ctaText || $t("landing.cta") }}
        </a>
        <a v-if="content.ctaExploreLabel" href="#about" class="btn btn-outline btn-lg">
          {{ content.ctaExploreLabel }}
        </a>
      </div>
    </div>
  </section>
</template>
