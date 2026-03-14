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
    class="btn flex h-11 min-h-11 w-full justify-start gap-3 rounded-full px-3 text-sm font-medium"
    :class="active ? 'btn-primary' : 'btn-secondary'"
  >
    <Icon v-if="iconPath && iconPath.includes(':')" :name="iconPath" class="h-4 w-4 flex-none" aria-hidden="true" />
    <svg v-else-if="iconPath" class="h-4 w-4 flex-none" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path :d="iconPath" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
    <span class="truncate">{{ label }}</span>
  </NuxtLink>
  <div
    v-else
    class="btn btn-secondary btn-disabled flex h-11 min-h-11 w-full justify-start gap-3 rounded-full px-3 text-sm font-medium opacity-60"
  >
    <Icon v-if="iconPath && iconPath.includes(':')" :name="iconPath" class="h-4 w-4 flex-none" aria-hidden="true" />
    <svg v-else-if="iconPath" class="h-4 w-4 flex-none" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path :d="iconPath" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
    <span class="truncate">{{ label }}</span>
  </div>
</template>
