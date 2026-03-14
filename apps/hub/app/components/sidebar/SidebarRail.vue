<script setup lang="ts">
interface SidebarRailEntry {
  id: string;
  to: string;
  label: string;
  iconPath: string;
}

defineProps<{
  items: SidebarRailEntry[];
  activeId: string;
}>();
</script>

<template>
  <aside class="flex h-full w-16 flex-col items-center gap-3 px-2 py-3">
    <slot name="toggle" />
    <slot name="brand" />

    <div class="mt-2 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
      <SidebarRailItem
        v-for="item in items"
        :key="item.id"
        :to="item.to"
        :label="item.label"
        :icon-path="item.iconPath"
        :active="item.id === activeId"
      />
    </div>

    <div class="flex flex-col gap-2">
      <slot name="utility" />
    </div>
  </aside>
</template>
