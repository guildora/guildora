<script setup lang="ts">
withDefaults(
  defineProps<{
    tone?: "primary" | "secondary";
  }>(),
  {
    tone: "primary"
  }
);
</script>

<template>
  <span class="badge" :class="tone === 'primary' ? 'badge-warning' : 'badge-info'">
    <slot />
  </span>
</template>
