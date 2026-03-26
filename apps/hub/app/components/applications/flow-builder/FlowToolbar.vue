<script setup lang="ts">
const { t } = useI18n();

const props = defineProps<{
  saveStatus: "idle" | "saving" | "saved" | "error";
  canUndo: boolean;
  canRedo: boolean;
}>();

const emit = defineEmits<{
  (e: "undo"): void;
  (e: "redo"): void;
}>();

type NodePaletteItem = {
  type: string;
  labelKey: string;
  icon: string;
};

const nodeTypes: NodePaletteItem[] = [
  { type: "input", labelKey: "applications.flowBuilder.toolbar.inputField", icon: "proicons:text-font" },
  { type: "info", labelKey: "applications.flowBuilder.toolbar.infoHint", icon: "proicons:info" },
  { type: "conditional_branch", labelKey: "applications.flowBuilder.nodes.branch", icon: "proicons:grid" },
  { type: "abort", labelKey: "applications.flowBuilder.nodes.abort", icon: "proicons:lock" },
  { type: "role_assignment", labelKey: "applications.flowBuilder.nodes.roleAssignment", icon: "proicons:shield" },
  { type: "step_group", labelKey: "applications.flowBuilder.nodes.stepGroup", icon: "proicons:person-multiple" },
  { type: "end", labelKey: "applications.flowBuilder.nodes.end", icon: "proicons:checkmark-circle" },
];

function onDragStart(event: DragEvent, nodeType: string) {
  if (!event.dataTransfer) return;
  event.dataTransfer.setData("application/vueflow-nodetype", nodeType);
  event.dataTransfer.effectAllowed = "move";
}

const saveStatusLabel = computed(() => {
  switch (props.saveStatus) {
    case "saving": return t("applications.flowBuilder.toolbar.saving");
    case "saved": return t("applications.flowBuilder.toolbar.saved");
    case "error": return t("applications.flowBuilder.toolbar.saveFailed");
    default: return "";
  }
});

const saveStatusColor = computed(() => {
  switch (props.saveStatus) {
    case "saving": return "var(--color-base-content-secondary)";
    case "saved": return "var(--color-success)";
    case "error": return "var(--color-error)";
    default: return "transparent";
  }
});
</script>

<template>
  <div class="flow-toolbar">
    <div class="flow-toolbar__section">
      <span class="flow-toolbar__title">{{ t("applications.flowBuilder.toolbar.nodes") }}</span>
      <div class="flow-toolbar__palette">
        <div
          v-for="item in nodeTypes"
          :key="item.type"
          class="flow-toolbar__node-item"
          draggable="true"
          @dragstart="onDragStart($event, item.type)"
        >
          <Icon :name="item.icon" class="text-base" />
          <span>{{ t(item.labelKey) }}</span>
        </div>
      </div>
    </div>

    <div class="flow-toolbar__actions">
      <button
        class="btn btn-ghost btn-sm"
        :disabled="!canUndo"
        :title="t('applications.flowBuilder.toolbar.undoTooltip')"
        @click="emit('undo')"
      >
        <Icon name="proicons:arrow-undo" />
      </button>
      <button
        class="btn btn-ghost btn-sm"
        :disabled="!canRedo"
        :title="t('applications.flowBuilder.toolbar.redoTooltip')"
        @click="emit('redo')"
      >
        <Icon name="proicons:arrow-redo" />
      </button>

      <span
        v-if="saveStatusLabel"
        class="flow-toolbar__save-status"
        :style="{ color: saveStatusColor }"
      >
        {{ saveStatusLabel }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.flow-toolbar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 14rem;
  padding: 1rem;
  background: var(--color-surface-2);
  border-right: 1px solid var(--color-line);
  overflow-y: auto;
  flex-shrink: 0;
}

.flow-toolbar__title {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-base-content-secondary);
}

.flow-toolbar__palette {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-top: 0.5rem;
}

.flow-toolbar__node-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.8125rem;
  cursor: grab;
  color: var(--color-base-content);
  background: var(--color-surface-3);
  border: 1px solid transparent;
  transition: border-color 0.15s;
}

.flow-toolbar__node-item:hover {
  border-color: var(--color-accent);
}

.flow-toolbar__node-item:active {
  cursor: grabbing;
}

.flow-toolbar__actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: auto;
  padding-top: 0.75rem;
  border-top: 1px solid var(--color-line);
}

.flow-toolbar__save-status {
  font-size: 0.75rem;
  margin-left: auto;
}
</style>
