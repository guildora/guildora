<script setup lang="ts">
import { Handle, Position } from "@vue-flow/core";
import type { NodeProps } from "@vue-flow/core";
import type { FlowConditionalBranchNodeData } from "@guildora/shared";

const props = defineProps<NodeProps>();

const { t } = useI18n();
const data = computed(() => props.data as FlowConditionalBranchNodeData);
</script>

<template>
  <div class="flow-node flow-node--branch">
    <Handle type="target" :position="Position.Top" />
    <div class="flow-node__header">
      <span class="flow-node__type-badge flow-node__type-badge--branch">{{ t("applications.flowBuilder.nodes.branch") }}</span>
    </div>
    <div class="flow-node__label">{{ t("applications.flowBuilder.nodes.conditional") }}</div>
    <div v-if="data.branches?.length" class="flow-node__branches">
      <div v-for="(branch, i) in data.branches" :key="branch.handleId" class="flow-node__branch-item">
        <span class="text-xs">{{ branch.label }}</span>
        <Handle
          :id="branch.handleId"
          type="source"
          :position="Position.Bottom"
          :style="{ left: `${((i + 1) / (data.branches.length + 1)) * 100}%` }"
        />
      </div>
    </div>
    <Handle v-if="!data.branches?.length" type="source" :position="Position.Bottom" />
  </div>
</template>

<style scoped>
.flow-node--branch {
  min-width: 180px;
  padding: 0.75rem;
  border-radius: 0.75rem;
  background: var(--color-surface-2);
  box-shadow: var(--shadow-sm);
  border-left: 3px solid var(--color-warning);
}

.flow-node__header {
  margin-bottom: 0.375rem;
}

.flow-node__type-badge--branch {
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  padding: 0.0625rem 0.375rem;
  border-radius: 0.25rem;
  background: color-mix(in srgb, var(--color-warning) 15%, transparent);
  color: var(--color-warning);
}

.flow-node__label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-base-content);
}

.flow-node__branches {
  margin-top: 0.5rem;
  display: flex;
  gap: 0.5rem;
}

.flow-node__branch-item {
  position: relative;
  color: var(--color-base-content-secondary);
}
</style>
