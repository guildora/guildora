<script setup lang="ts">
defineProps<{
  title: string;
}>();
</script>

<template>
  <header class="border-b border-line pb-3">
    <h2 class="truncate text-xl font-semibold text-base-content">{{ title }}</h2>
  </header>
</template>
