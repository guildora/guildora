<script setup lang="ts">
import type { ApplicationFlowGraph } from "@guildora/shared";
import type { Node } from "@vue-flow/core";
import { useFlowBuilder } from "~/composables/useFlowBuilder";

definePageMeta({
  middleware: ["moderator"],
});

const route = useRoute();
const flowId = route.params.flowId as string;
const { t } = useI18n();

type FlowResponse = {
  flow: {
    id: string;
    name: string;
    status: string;
    flowJson: ApplicationFlowGraph;
  };
};

const { data, pending, error } = await useFetch<FlowResponse>(`/api/applications/flows/${flowId}`);

const {
  nodes,
  edges,
  saveStatus,
  canUndo,
  canRedo,
  loadGraph,
  onGraphChange,
  undo,
  redo
} = useFlowBuilder(flowId);

// Load graph when data arrives
watch(data, (d) => {
  if (d?.flow?.flowJson) {
    loadGraph(d.flow.flowJson);
  }
}, { immediate: true });

// Selected node for sidebar
const selectedNode = ref<Node | null>(null);

function onNodeClick(node: Node) {
  selectedNode.value = node;
}

function onCloseSidebar() {
  selectedNode.value = null;
}

function onUpdateNodeData(nodeId: string, newData: Record<string, unknown>) {
  const node = nodes.value.find((n) => n.id === nodeId);
  if (node) {
    node.data = newData;
    onGraphChange();
  }
}

function onDeleteNode(nodeId: string) {
  nodes.value = nodes.value.filter((n) => n.id !== nodeId && n.parentNode !== nodeId);
  edges.value = edges.value.filter((e) => e.source !== nodeId && e.target !== nodeId);
  selectedNode.value = null;
  onGraphChange();
}

// Keyboard shortcuts
function onKeydown(event: KeyboardEvent) {
  if (event.key === "z" && (event.ctrlKey || event.metaKey)) {
    if (event.shiftKey) {
      redo();
    } else {
      undo();
    }
    event.preventDefault();
  }
  if (event.key === "Delete" || event.key === "Backspace") {
    if (selectedNode.value && !["start"].includes(selectedNode.value.type || "")) {
      onDeleteNode(selectedNode.value.id);
    }
  }
}

onMounted(() => {
  window.addEventListener("keydown", onKeydown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", onKeydown);
});
</script>

<template>
  <div v-if="pending" class="flex h-full items-center justify-center">
    <span class="loading loading-spinner loading-md" />
  </div>
  <div v-else-if="error" class="flex h-full items-center justify-center">
    <div class="alert alert-error">{{ t("common.error") }}</div>
  </div>
  <div v-else class="flow-builder">
    <!-- Header bar -->
    <div class="flow-builder__header">
      <NuxtLink to="/applications/flows" class="text-sm hover:underline" style="color: var(--color-accent)">
        &larr; {{ t("applications.flows") }}
      </NuxtLink>
      <span class="text-lg font-semibold ml-3">{{ data?.flow?.name }}</span>
      <NuxtLink
        :to="`/applications/flows/${flowId}/settings`"
        class="btn btn-outline btn-sm ml-auto"
      >
        {{ t("applications.actions.settings") }}
      </NuxtLink>
    </div>

    <!-- Builder body (client-only to avoid Vue Flow SSR hydration mismatches) -->
    <ClientOnly>
      <div class="flow-builder__body">
        <ApplicationsFlowBuilderFlowToolbar
          :save-status="saveStatus"
          :can-undo="canUndo"
          :can-redo="canRedo"
          @undo="undo"
          @redo="redo"
        />

        <ApplicationsFlowBuilderFlowCanvas
          :nodes="nodes"
          :edges="edges"
          @nodes-change="(n) => (nodes = n)"
          @edges-change="(e) => (edges = e)"
          @node-click="onNodeClick"
          @graph-change="onGraphChange"
        />

        <ApplicationsFlowBuilderFlowNodeSidebar
          v-if="selectedNode"
          :node="selectedNode"
          :nodes="nodes"
          @update-node-data="onUpdateNodeData"
          @delete-node="onDeleteNode"
          @close="onCloseSidebar"
        />
      </div>
      <template #fallback>
        <div class="flow-builder__body flex items-center justify-center">
          <span class="loading loading-spinner loading-md" />
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<style scoped>
.flow-builder {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 2rem);
}

.flow-builder__header {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--color-line);
  background: var(--color-surface-1);
  flex-shrink: 0;
}

.flow-builder__body {
  display: flex;
  flex: 1;
  min-height: 0;
}
</style>
