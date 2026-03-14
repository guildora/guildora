<script setup lang="ts">
defineProps<{
  to: string;
  label: string;
  iconPath: string;
  active?: boolean;
}>();
</script>

<template>
  <NuxtLink
    :to="to"
    class="btn group h-11 min-h-11 w-11 rounded-full p-0"
    :class="active ? 'btn-primary' : 'btn-secondary'"
    :aria-label="label"
    :title="label"
  >
    <Icon v-if="iconPath.includes(':')" :name="iconPath" class="h-5 w-5" aria-hidden="true" />
    <svg v-else class="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path :d="iconPath" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
    <span class="sr-only">{{ label }}</span>
  </NuxtLink>
</template>
