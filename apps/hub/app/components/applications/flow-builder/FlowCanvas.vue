<script setup lang="ts">
import { VueFlow, useVueFlow } from "@vue-flow/core";
import { Background } from "@vue-flow/background";
import { Controls } from "@vue-flow/controls";
import { MiniMap } from "@vue-flow/minimap";
import type { Node, Edge, Connection } from "@vue-flow/core";
import { markRaw } from "vue";

import StartNode from "./nodes/StartNode.vue";
import EndNode from "./nodes/EndNode.vue";
import InputNode from "./nodes/InputNode.vue";
import InfoNode from "./nodes/InfoNode.vue";
import ConditionalBranchNode from "./nodes/ConditionalBranchNode.vue";
import AbortNode from "./nodes/AbortNode.vue";
import RoleAssignmentNode from "./nodes/RoleAssignmentNode.vue";
import StepGroupNode from "./nodes/StepGroupNode.vue";

const props = defineProps<{
  nodes: Node[];
  edges: Edge[];
}>();

const emit = defineEmits<{
  (e: "nodes-change", nodes: Node[]): void;
  (e: "edges-change", edges: Edge[]): void;
  (e: "node-click", node: Node): void;
  (e: "graph-change"): void;
}>();

const nodeTypes = {
  start: markRaw(StartNode),
  end: markRaw(EndNode),
  input: markRaw(InputNode),
  info: markRaw(InfoNode),
  conditional_branch: markRaw(ConditionalBranchNode),
  abort: markRaw(AbortNode),
  role_assignment: markRaw(RoleAssignmentNode),
  step_group: markRaw(StepGroupNode),
};

// Local writable refs for VueFlow (props are readonly)
const localNodes = ref<Node[]>([]);
const localEdges = ref<Edge[]>([]);

// Sync props → local refs
watch(() => props.nodes, (n) => { localNodes.value = [...n]; }, { immediate: true });
watch(() => props.edges, (e) => { localEdges.value = [...e]; }, { immediate: true });

const {
  onConnect,
  addEdges,
  addNodes,
  onNodesChange,
  onEdgesChange,
  onNodeClick,
  screenToFlowCoordinate
} = useVueFlow();

// Connect handler
onConnect((params: Connection) => {
  const edgeId = `e_${params.source}_${params.target}_${Date.now()}`;
  addEdges([{
    id: edgeId,
    source: params.source,
    target: params.target,
    sourceHandle: params.sourceHandle ?? undefined,
    targetHandle: params.targetHandle ?? undefined,
  }]);
  emit("graph-change");
});

// Change handlers
onNodesChange(() => {
  nextTick(() => {
    emit("nodes-change", localNodes.value);
    emit("graph-change");
  });
});

onEdgesChange(() => {
  nextTick(() => {
    emit("edges-change", localEdges.value);
    emit("graph-change");
  });
});

onNodeClick(({ node }: { node: Node }) => {
  emit("node-click", node);
});

// Drag and drop from toolbar
function onDragOver(event: DragEvent) {
  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = "move";
  }
}

const { t } = useI18n();

function getDefaultDataForType(type: string): Record<string, unknown> {
  switch (type) {
    case "input":
      return { inputType: "short_text", label: t("applications.flowBuilder.sidebar.newField"), required: false, options: [] };
    case "info":
      return { markdown: "" };
    case "conditional_branch":
      return { sourceNodeId: "", branches: [] };
    case "abort":
      return { message: t("applications.flowBuilder.nodes.applicationAborted") };
    case "role_assignment":
      return { roleIds: [], roleNameSnapshots: [] };
    case "step_group":
      return { title: t("applications.flowBuilder.nodes.stepGroup") };
    case "end":
      return {};
    default:
      return {};
  }
}

function onDrop(event: DragEvent) {
  const nodeType = event.dataTransfer?.getData("application/vueflow-nodetype");
  if (!nodeType) return;

  const position = screenToFlowCoordinate({
    x: event.clientX,
    y: event.clientY,
  });

  const newNode: Node = {
    id: `node_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type: nodeType,
    position,
    data: getDefaultDataForType(nodeType),
  };

  addNodes([newNode]);
  emit("graph-change");
}
</script>

<template>
  <div class="flow-canvas" @drop="onDrop" @dragover="onDragOver">
    <VueFlow
      v-model:nodes="localNodes"
      v-model:edges="localEdges"
      :node-types="nodeTypes"
      :default-viewport="{ zoom: 0.8, x: 50, y: 50 }"
      :min-zoom="0.2"
      :max-zoom="2"
      fit-view-on-init
      class="flow-canvas__vueflow"
    >
      <Background />
      <Controls />
      <MiniMap />
    </VueFlow>
  </div>
</template>

<style scoped>
.flow-canvas {
  flex: 1;
  height: 100%;
  position: relative;
}

.flow-canvas__vueflow {
  width: 100%;
  height: 100%;
}
</style>
