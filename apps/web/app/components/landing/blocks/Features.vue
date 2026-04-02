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
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="(feature, i) in (content.features as Array<Record<string, unknown>>)"
        :key="i"
        :class="[
          'rounded-xl p-5 transition-transform duration-200 hover:-translate-y-0.5',
          variant === 'gaming' ? 'bg-gradient-to-br from-white/5 to-white/[0.02] border border-purple-500/20 shadow-lg shadow-purple-500/5' :
          variant === 'esports' ? 'bg-white/5 border border-white/10' :
          'bg-[var(--color-surface-2,#1a1a2e)] shadow-md'
        ]"
      >
        <div class="mb-2 text-3xl">{{ feature.icon }}</div>
        <h3 class="text-base font-bold mb-1">{{ feature.title }}</h3>
        <p class="text-sm opacity-70">{{ feature.description }}</p>
      </div>
    </div>
  </section>
</template>
