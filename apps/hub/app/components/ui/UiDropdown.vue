<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string;
  }>(),
  {
    title: ""
  }
);
</script>

<template>
  <div class="rounded-2xl border border-accent-subtle bg-base-100 p-2 shadow-sm">
    <p v-if="title" class="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-base-content/65">{{ title }}</p>
    <slot />
  </div>
</template>
