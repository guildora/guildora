<script setup lang="ts">
const props = defineProps<{
  content: Record<string, unknown>;
  config: Record<string, unknown>;
}>();

const variant = computed(() => String(props.config.layoutVariant || "default"));
</script>

<template>
  <section class="py-16 md:py-24">
    <h2 v-if="content.sectionTitle" class="mb-10 text-center text-3xl font-bold tracking-tight md:text-4xl">
      {{ content.sectionTitle }}
    </h2>
    <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
      <div
        v-for="(stat, i) in (content.stats as Array<Record<string, unknown>>)"
        :key="i"
        :class="[
          'rounded-xl p-6 text-center',
          variant === 'gaming' ? 'bg-gradient-to-b from-purple-500/10 to-surface-2 shadow-md' :
          variant === 'esports' ? 'bg-surface-2 shadow-md' :
          'bg-surface-2 shadow-md'
        ]"
      >
        <span
          :class="[
            'block text-4xl font-extrabold md:text-5xl',
            variant === 'gaming' ? 'text-purple-400' :
            'text-accent'
          ]"
        >{{ stat.value }}</span>
        <p class="mt-2 text-sm font-medium text-[var(--color-text-secondary)]">{{ stat.label }}</p>
      </div>
    </div>
  </section>
</template>
