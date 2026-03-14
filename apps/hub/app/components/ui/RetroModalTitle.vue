<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    title: string;
    subtitle?: string;
  }>(),
  {
    subtitle: ""
  }
);
</script>

<template>
  <header class="space-y-1">
    <h2 class="text-xl font-semibold text-base-content">{{ props.title }}</h2>
    <p v-if="props.subtitle" class="text-sm text-base-content/70">{{ props.subtitle }}</p>
  </header>
</template>
