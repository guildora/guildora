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
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="(feature, i) in (content.features as Array<Record<string, unknown>>)"
        :key="i"
        class="card bg-base-200 shadow-md transition-transform duration-200 hover:-translate-y-0.5"
      >
        <div class="card-body gap-2">
          <div class="mb-1 text-4xl">{{ feature.icon }}</div>
          <h3 class="card-title text-base font-bold">{{ feature.title }}</h3>
          <p class="text-sm opacity-70">{{ feature.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
