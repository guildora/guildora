<script setup lang="ts">
import { Handle, Position } from "@vue-flow/core";
import type { NodeProps } from "@vue-flow/core";

defineProps<NodeProps>();
const { t } = useI18n();
</script>

<template>
  <div class="flow-node flow-node--end">
    <Handle type="target" :position="Position.Top" />
    <div class="flow-node__label">{{ t("applications.flowBuilder.nodes.end") }}</div>
  </div>
</template>

<style scoped>
.flow-node--end {
  min-width: 80px;
  text-align: center;
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  background: var(--color-success);
  color: var(--color-success-content);
  font-weight: 600;
  font-size: 0.875rem;
}
</style>
