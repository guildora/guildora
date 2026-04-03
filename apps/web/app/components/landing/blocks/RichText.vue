<script setup lang="ts">
defineProps<{
  content: Record<string, unknown>;
  config: Record<string, unknown>;
}>();
</script>

<template>
  <section id="about" class="mx-auto max-w-3xl py-16 md:py-24">
    <h2 v-if="content.title" class="mb-5 text-3xl font-bold tracking-tight md:text-4xl">{{ content.title }}</h2>
    <p v-if="content.body" class="text-base leading-relaxed text-[var(--color-text-secondary)] md:text-lg">{{ content.body }}</p>
  </section>
</template>
