<script setup lang="ts">
interface SidebarPanelItem {
  to?: string;
  label: string;
  iconPath?: string;
  active?: boolean;
  disabled?: boolean;
}

defineProps<{
  title?: string;
  items: SidebarPanelItem[];
}>();
</script>

<template>
  <section class="space-y-2">
    <h3 v-if="title" class="px-2 text-xs font-semibold uppercase tracking-wide text-base-content/55">{{ title }}</h3>
    <div class="space-y-1">
      <SidebarItem
        v-for="item in items"
        :key="`${item.label}-${item.to || 'no-link'}`"
        :to="item.to"
        :label="item.label"
        :icon-path="item.iconPath"
        :active="item.active"
        :disabled="item.disabled"
      />
    </div>
  </section>
</template>
