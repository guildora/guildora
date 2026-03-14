<script setup lang="ts">
interface SidebarPanelItem {
  to?: string;
  label: string;
  iconPath?: string;
  active?: boolean;
  disabled?: boolean;
}

interface SidebarPanelGroup {
  id: string;
  title?: string;
  items: SidebarPanelItem[];
}

defineProps<{
  title: string;
  collapsed: boolean;
  groups: SidebarPanelGroup[];
}>();

defineEmits<{
  (event: "toggle"): void;
}>();
</script>

<template>
  <div
    class="h-full overflow-hidden p-4 transition-all duration-200"
    :class="collapsed ? 'w-0 opacity-0 pointer-events-none' : 'w-[280px] opacity-100'"
  >
    <SidebarHeader :title="title" />

    <div class="mt-4 space-y-4">
      <SidebarGroup v-for="group in groups" :key="group.id" :title="group.title" :items="group.items" />
    </div>

    <div class="mt-6 border-t border-line pt-4">
      <slot name="footer" />
    </div>
  </div>
</template>
