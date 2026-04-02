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
      'relative overflow-hidden rounded-2xl shadow-md',
      variant === 'gaming' ? 'bg-gradient-to-br from-purple-900/80 via-gray-900 to-gray-900' :
      variant === 'esports' ? 'bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border border-white/10' :
      'bg-[var(--color-surface-2,#1a1a2e)]'
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
        variant === 'esports' ? 'bg-gradient-to-b from-[var(--color-accent,#7C3AED)]/15 via-transparent to-transparent' :
        'bg-gradient-to-br from-[var(--color-accent,#7C3AED)]/10 via-transparent to-transparent'
      ]"
    />
    <div class="relative flex min-h-[56vh] flex-col items-center justify-center px-6 py-16 text-center md:py-24">
      <span
        v-if="content.eyebrowLabel"
        :class="[
          'mb-5 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest',
          variant === 'gaming' ? 'border border-purple-400/40 bg-purple-500/15 text-purple-300' :
          variant === 'esports' ? 'border border-[var(--color-accent,#7C3AED)]/50 bg-[var(--color-accent,#7C3AED)]/10 text-[var(--color-accent,#7C3AED)]' :
          'border border-[var(--color-accent,#7C3AED)]/40 bg-[var(--color-accent,#7C3AED)]/10 text-[var(--color-accent,#7C3AED)]'
        ]"
      >
        {{ content.eyebrowLabel }}
      </span>
      <h1
        :class="[
          'mb-4 font-extrabold leading-tight tracking-tight',
          variant === 'esports' ? 'text-4xl md:text-6xl lg:text-7xl uppercase' :
          'text-4xl md:text-6xl lg:text-7xl'
        ]"
      >
        {{ content.heading }}
      </h1>
      <p class="mb-8 max-w-2xl text-base opacity-70 md:text-lg">{{ content.subheading }}</p>
      <div class="flex flex-wrap items-center justify-center gap-3">
        <a
          v-if="content.ctaLink"
          :href="String(content.ctaLink)"
          :class="[
            'inline-block rounded-lg px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-90',
            variant === 'gaming' ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white' :
            'bg-[var(--color-accent,#7C3AED)] text-white'
          ]"
        >
          {{ content.ctaText || $t("landing.cta") }}
        </a>
        <a
          v-if="content.ctaExploreLabel"
          href="#about"
          class="inline-block rounded-lg border border-white/20 px-6 py-3 text-sm font-semibold hover:bg-white/5 transition-colors"
        >
          {{ content.ctaExploreLabel }}
        </a>
      </div>
    </div>
  </section>
</template>
