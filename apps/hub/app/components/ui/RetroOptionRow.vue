<script setup lang="ts">
withDefaults(
  defineProps<{
    active?: boolean;
  }>(),
  {
    active: false
  }
);
</script>

<template>
  <button
    type="button"
    class="w-full rounded-xl px-3 py-2 text-left text-base font-medium transition-colors"
    :class="active ? 'bg-base-300 text-base-content' : 'bg-transparent text-base-content/85 hover:bg-base-200'"
  >
    <slot />
  </button>
</template>
