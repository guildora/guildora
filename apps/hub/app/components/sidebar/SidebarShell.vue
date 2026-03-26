<script setup lang="ts">
interface SidebarRailEntry {
  id: string;
  to: string;
  label: string;
  iconPath: string;
}

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
  railItems: SidebarRailEntry[];
  activeRailId: string;
  panelTitle: string;
  panelGroups: SidebarPanelGroup[];
  collapsed: boolean;
}>();

defineEmits<{
  (event: "toggle-panel"): void;
}>();
</script>

<template>
  <div class="flex h-full rounded-r-2xl border-r border-line/60 bg-base-100/95 shadow-lg">
    <div class="flex w-16 shrink-0 flex-col">
      <SidebarRail :items="railItems" :active-id="activeRailId" class="min-h-0 flex-1">
        <template #toggle>
          <SidebarCollapseTrigger :collapsed="collapsed" @toggle="$emit('toggle-panel')" />
        </template>
        <template #brand>
          <slot name="brand" />
        </template>
        <template #utility>
          <slot name="utility" />
        </template>
      </SidebarRail>
    </div>

    <template v-if="!collapsed">
      <div class="w-px shrink-0 bg-line" aria-hidden="true" />

      <SidebarPanel :title="panelTitle" :collapsed="false" :groups="panelGroups" @toggle="$emit('toggle-panel')">
        <template #footer>
          <slot name="panel-footer" />
        </template>
      </SidebarPanel>
    </template>
  </div>
</template>
