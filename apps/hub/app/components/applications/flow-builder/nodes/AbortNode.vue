<script setup lang="ts">
import { Handle, Position } from "@vue-flow/core";
import type { NodeProps } from "@vue-flow/core";
import type { FlowAbortNodeData } from "@guildora/shared";

const props = defineProps<NodeProps>();

const { t } = useI18n();
const data = computed(() => props.data as FlowAbortNodeData);
</script>

<template>
  <div class="flow-node flow-node--abort">
    <Handle type="target" :position="Position.Top" />
    <div class="flow-node__header">
      <span class="flow-node__type-badge flow-node__type-badge--abort">{{ t("applications.flowBuilder.nodes.abort") }}</span>
    </div>
    <div class="flow-node__label">{{ data.message || t("applications.flowBuilder.nodes.applicationAborted") }}</div>
  </div>
</template>

<style scoped>
.flow-node--abort {
  min-width: 160px;
  padding: 0.75rem;
  border-radius: 0.75rem;
  background: var(--color-surface-2);
  box-shadow: var(--shadow-sm);
  border-left: 3px solid var(--color-error);
}

.flow-node__header {
  margin-bottom: 0.375rem;
}

.flow-node__type-badge--abort {
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  padding: 0.0625rem 0.375rem;
  border-radius: 0.25rem;
  background: color-mix(in srgb, var(--color-error) 15%, transparent);
  color: var(--color-error);
}

.flow-node__label {
  font-size: 0.8125rem;
  color: var(--color-base-content-secondary);
}
</style>
