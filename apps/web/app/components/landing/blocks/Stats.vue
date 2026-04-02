<script setup lang="ts">
const props = defineProps<{
  content: Record<string, unknown>;
  config: Record<string, unknown>;
}>();

const variant = computed(() => String(props.config.layoutVariant || "default"));
</script>

<template>
  <section class="py-6">
    <h2 v-if="content.sectionTitle" class="mb-8 text-center text-2xl font-bold md:text-3xl">
      {{ content.sectionTitle }}
    </h2>
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="(stat, i) in (content.stats as Array<Record<string, unknown>>)"
        :key="i"
        :class="[
          'rounded-xl p-5 text-center',
          variant === 'gaming' ? 'bg-gradient-to-b from-purple-500/10 to-transparent border border-purple-500/20' :
          variant === 'esports' ? 'bg-white/5 border border-white/10' :
          'bg-[var(--color-surface-2,#1a1a2e)] shadow-md'
        ]"
      >
        <span
          :class="[
            'block text-3xl font-extrabold',
            variant === 'gaming' ? 'text-purple-400' :
            'text-[var(--color-accent,#7C3AED)]'
          ]"
        >{{ stat.value }}</span>
        <p class="text-sm font-medium opacity-70 mt-1">{{ stat.label }}</p>
      </div>
    </div>
  </section>
</template>
