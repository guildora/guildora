<script setup lang="ts">
defineProps<{
  to?: string;
  label: string;
  active?: boolean;
  iconPath?: string;
  disabled?: boolean;
}>();
</script>

<template>
  <NuxtLink
    v-if="to && !disabled"
    :to="to"
    class="sidebar-item"
    :class="{ 'sidebar-item-active': active }"
  >
    <Icon v-if="iconPath && iconPath.includes(':')" :name="iconPath" class="h-4 w-4 flex-none opacity-60" aria-hidden="true" />
    <svg v-else-if="iconPath" class="h-4 w-4 flex-none opacity-60" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path :d="iconPath" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
    <span class="truncate">{{ label }}</span>
  </NuxtLink>
  <div
    v-else
    class="sidebar-item pointer-events-none opacity-40"
  >
    <Icon v-if="iconPath && iconPath.includes(':')" :name="iconPath" class="h-4 w-4 flex-none opacity-60" aria-hidden="true" />
    <svg v-else-if="iconPath" class="h-4 w-4 flex-none opacity-60" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path :d="iconPath" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
    <span class="truncate">{{ label }}</span>
  </div>
</template>
