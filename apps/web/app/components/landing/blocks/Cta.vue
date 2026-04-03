<script setup lang="ts">
const props = defineProps<{
  content: Record<string, unknown>;
  config: Record<string, unknown>;
}>();

const variant = computed(() => String(props.config.variant || props.content.variant || "default"));
</script>

<template>
  <section
    :class="[
      'rounded-2xl px-6 py-14 text-center md:px-8 md:py-20',
      variant === 'accent'
        ? 'bg-accent text-white'
        : 'bg-surface-2 shadow-md'
    ]"
  >
    <h2 class="mx-auto max-w-2xl text-3xl font-bold tracking-tight md:text-4xl">{{ content.heading }}</h2>
    <p :class="['mx-auto mt-4 max-w-xl text-base leading-relaxed', variant === 'accent' ? 'text-white/85' : 'text-[var(--color-text-secondary)]']">
      {{ content.description }}
    </p>
    <div class="mt-8">
      <a
        :href="String(content.buttonLink)"
        :class="[
          'inline-flex items-center rounded-lg px-8 py-3.5 text-base font-semibold transition-all duration-200 hover:brightness-110',
          variant === 'accent'
            ? 'bg-white text-accent hover:bg-white/90'
            : 'bg-accent text-white'
        ]"
      >
        {{ content.buttonText }}
      </a>
    </div>
  </section>
</template>
