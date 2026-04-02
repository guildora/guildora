<script setup lang="ts">
defineProps<{
  content: Record<string, unknown>;
  config: Record<string, unknown>;
}>();
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
        class="card bg-base-200 shadow-md"
      >
        <div class="card-body items-center text-center">
          <span class="text-3xl font-extrabold text-accent">{{ stat.value }}</span>
          <p class="text-sm font-medium opacity-70">{{ stat.label }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
