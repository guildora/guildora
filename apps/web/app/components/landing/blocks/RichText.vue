<script setup lang="ts">
defineProps<{
  content: Record<string, unknown>;
  config: Record<string, unknown>;
}>();
</script>

<template>
  <section id="about" class="mx-auto max-w-3xl py-6">
    <h2 v-if="content.title" class="mb-4 text-2xl font-bold md:text-3xl">{{ content.title }}</h2>
    <p v-if="content.body" class="mb-4 text-sm leading-relaxed opacity-75 md:text-base">{{ content.body }}</p>
  </section>
</template>
