<script setup lang="ts">
import { Handle, Position } from "@vue-flow/core";
import type { NodeProps } from "@vue-flow/core";

defineProps<NodeProps>();
const { t } = useI18n();
</script>

<template>
  <div class="flow-node flow-node--start">
    <div class="flow-node__label">{{ t("applications.flowBuilder.nodes.start") }}</div>
    <Handle type="source" :position="Position.Bottom" />
  </div>
</template>

<style scoped>
.flow-node--start {
  min-width: 80px;
  text-align: center;
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  background: var(--color-accent);
  color: var(--color-accent-content);
  font-weight: 600;
  font-size: 0.875rem;
}
</style>
