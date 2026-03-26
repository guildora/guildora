<script setup lang="ts">
import { Handle, Position } from "@vue-flow/core";
import type { NodeProps } from "@vue-flow/core";
import type { FlowInfoNodeData } from "@guildora/shared";

const props = defineProps<NodeProps>();

const { t } = useI18n();
const data = computed(() => props.data as FlowInfoNodeData);

const previewText = computed(() => {
  const md = data.value.markdown || "";
  return md.length > 80 ? md.slice(0, 80) + "..." : md;
});
</script>

<template>
  <div class="flow-node flow-node--info">
    <Handle type="target" :position="Position.Top" />
    <div class="flow-node__header">
      <span class="flow-node__type-badge flow-node__type-badge--info">{{ t("applications.flowBuilder.nodes.info") }}</span>
    </div>
    <div class="flow-node__label">{{ previewText || t("applications.flowBuilder.nodes.infoBlock") }}</div>
    <div v-if="data.ctaLabel" class="flow-node__cta">{{ data.ctaLabel }}</div>
    <Handle type="source" :position="Position.Bottom" />
  </div>
</template>

<style scoped>
.flow-node--info {
  min-width: 180px;
  padding: 0.75rem;
  border-radius: 0.75rem;
  background: var(--color-surface-2);
  box-shadow: var(--shadow-sm);
  border-left: 3px solid var(--color-info);
}

.flow-node__header {
  margin-bottom: 0.375rem;
}

.flow-node__type-badge--info {
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  padding: 0.0625rem 0.375rem;
  border-radius: 0.25rem;
  background: color-mix(in srgb, var(--color-info) 15%, transparent);
  color: var(--color-info);
}

.flow-node__label {
  font-size: 0.8125rem;
  color: var(--color-base-content-secondary);
  white-space: pre-wrap;
}

.flow-node__cta {
  margin-top: 0.375rem;
  font-size: 0.75rem;
  color: var(--color-accent);
  font-weight: 500;
}
</style>
