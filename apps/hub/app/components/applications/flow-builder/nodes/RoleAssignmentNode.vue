<script setup lang="ts">
import { Handle, Position } from "@vue-flow/core";
import type { NodeProps } from "@vue-flow/core";
import type { FlowRoleAssignmentNodeData } from "@guildora/shared";

const props = defineProps<NodeProps>();

const { t } = useI18n();
const data = computed(() => props.data as FlowRoleAssignmentNodeData);
</script>

<template>
  <div class="flow-node flow-node--role">
    <Handle type="target" :position="Position.Top" />
    <div class="flow-node__header">
      <span class="flow-node__type-badge flow-node__type-badge--role">{{ t("applications.flowBuilder.nodes.role") }}</span>
    </div>
    <div class="flow-node__roles">
      <span
        v-for="(name, i) in data.roleNameSnapshots || []"
        :key="i"
        class="flow-node__role-tag"
      >
        @{{ name }}
      </span>
      <span v-if="!data.roleNameSnapshots?.length" class="text-xs" style="color: var(--color-base-content-secondary)">
        {{ t("applications.flowBuilder.nodes.noRolesConfigured") }}
      </span>
    </div>
    <Handle type="source" :position="Position.Bottom" />
  </div>
</template>

<style scoped>
.flow-node--role {
  min-width: 140px;
  padding: 0.75rem;
  border-radius: 0.75rem;
  background: var(--color-surface-2);
  border: 1px dashed var(--color-accent);
}

.flow-node__header {
  margin-bottom: 0.375rem;
}

.flow-node__type-badge--role {
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  padding: 0.0625rem 0.375rem;
  border-radius: 0.25rem;
  background: color-mix(in srgb, var(--color-accent) 15%, transparent);
  color: var(--color-accent);
}

.flow-node__roles {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.flow-node__role-tag {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.0625rem 0.375rem;
  border-radius: 0.25rem;
  background: var(--color-surface-3);
  color: var(--color-base-content);
}
</style>
