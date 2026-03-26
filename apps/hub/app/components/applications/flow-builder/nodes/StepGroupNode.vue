<script setup lang="ts">
import { Handle, Position } from "@vue-flow/core";
import type { NodeProps } from "@vue-flow/core";
import type { FlowStepGroupNodeData } from "@guildora/shared";

const props = defineProps<NodeProps>();

const { t } = useI18n();
const data = computed(() => props.data as FlowStepGroupNodeData);
</script>

<template>
  <div class="flow-node flow-node--group">
    <Handle type="target" :position="Position.Top" />
    <div class="flow-node__header">
      <span class="flow-node__type-badge flow-node__type-badge--group">{{ t("applications.flowBuilder.nodes.stepGroup") }}</span>
    </div>
    <div class="flow-node__label">{{ data.title || t("applications.flowBuilder.nodes.stepGroup") }}</div>
    <p v-if="data.description" class="flow-node__desc">{{ data.description }}</p>
    <!-- Child nodes are rendered inside by Vue Flow's parentNode mechanism -->
    <Handle type="source" :position="Position.Bottom" />
  </div>
</template>

<style scoped>
.flow-node--group {
  min-width: 220px;
  min-height: 120px;
  padding: 0.75rem;
  border-radius: 0.75rem;
  background: color-mix(in srgb, var(--color-surface-2) 60%, transparent);
  border: 2px dashed var(--color-line);
}

.flow-node__header {
  margin-bottom: 0.375rem;
}

.flow-node__type-badge--group {
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  padding: 0.0625rem 0.375rem;
  border-radius: 0.25rem;
  background: var(--color-surface-3);
  color: var(--color-base-content-secondary);
}

.flow-node__label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-base-content);
}

.flow-node__desc {
  font-size: 0.75rem;
  color: var(--color-base-content-secondary);
  margin-top: 0.25rem;
}
</style>
