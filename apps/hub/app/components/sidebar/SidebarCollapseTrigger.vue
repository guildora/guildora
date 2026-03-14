<script setup lang="ts">
const { t } = useI18n();

defineProps<{
  collapsed: boolean;
}>();

defineEmits<{
  (event: "toggle"): void;
}>();
</script>

<template>
  <button
    class="btn btn-secondary btn-sm h-9 min-h-0 w-9 rounded-full p-0"
    type="button"
    :aria-label="collapsed ? t('internalNav.expandSidebar') : t('internalNav.collapseSidebar')"
    @click="$emit('toggle')"
  >
    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        :d="collapsed ? 'M9 6l6 6-6 6' : 'M15 6l-6 6 6 6'"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </button>
</template>
