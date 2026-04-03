<script setup lang="ts">
const props = defineProps<{
  content: Record<string, unknown>;
  config: Record<string, unknown>;
}>();

const variant = computed(() => String(props.config.layoutVariant || "default"));
</script>

<template>
  <section
    :class="[
      'relative overflow-hidden rounded-2xl',
      variant === 'gaming' ? 'bg-gradient-to-br from-purple-900/80 via-gray-900 to-gray-900' :
      variant === 'esports' ? 'bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900' :
      'bg-surface-2'
    ]"
  >
    <img
      v-if="content.backgroundImage"
      :src="String(content.backgroundImage)"
      alt=""
      class="absolute inset-0 h-full w-full object-cover opacity-20"
    />
    <div
      :class="[
        'absolute inset-0 pointer-events-none',
        variant === 'gaming' ? 'bg-gradient-to-br from-purple-500/20 via-transparent to-cyan-500/10' :
        variant === 'esports' ? 'bg-gradient-to-b from-accent-muted via-transparent to-transparent' :
        'bg-gradient-to-br from-accent-subtle via-transparent to-transparent'
      ]"
    />
    <div class="relative flex min-h-[60vh] flex-col items-center justify-center px-6 py-20 text-center md:py-32">
      <span
        v-if="content.eyebrowLabel"
        class="mb-6 inline-flex items-center rounded-full border border-accent-subtle-active bg-accent-subtle px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent-light"
      >
        {{ content.eyebrowLabel }}
      </span>
      <h1
        :class="[
          'mb-5 font-extrabold leading-[1.08] tracking-tight',
          variant === 'esports' ? 'text-4xl md:text-6xl lg:text-7xl uppercase' :
          'text-4xl md:text-6xl lg:text-7xl'
        ]"
      >
        {{ content.heading }}
      </h1>
      <p class="mb-10 max-w-2xl text-base leading-relaxed text-[var(--color-text-secondary)] md:text-lg">{{ content.subheading }}</p>
      <div class="flex flex-wrap items-center justify-center gap-4">
        <a
          v-if="content.ctaLink"
          :href="String(content.ctaLink)"
          :class="[
            'inline-flex items-center rounded-lg px-7 py-3.5 text-sm font-semibold transition-all duration-200 hover:brightness-110',
            variant === 'gaming' ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white' :
            'bg-accent text-white'
          ]"
        >
          {{ content.ctaText || $t("landing.cta") }}
        </a>
        <a
          v-if="content.ctaExploreLabel"
          href="#about"
          class="inline-flex items-center rounded-lg border border-white/15 px-7 py-3.5 text-sm font-semibold transition-all duration-200 hover:bg-white/[0.06] hover:border-white/25"
        >
          {{ content.ctaExploreLabel }}
        </a>
      </div>
    </div>
  </section>
</template>
