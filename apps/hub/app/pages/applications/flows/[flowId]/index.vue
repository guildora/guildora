<script setup lang="ts">
import type { ApplicationFlowGraph, EditorMode } from "@guildora/shared";
import type { Node, Edge } from "@vue-flow/core";
import { useFlowBuilder } from "~/composables/useFlowBuilder";
import { useOnboardingTour } from "~/composables/useOnboardingTour";
import type { TourStep } from "~/composables/useOnboardingTour";

definePageMeta({
  middleware: ["moderator"],
});

const route = useRoute();
const flowId = route.params.flowId as string;
const { t } = useI18n();
const { user } = useAuth();
const isDev = useRuntimeConfig().public.isDev;

type FlowResponse = {
  flow: {
    id: string;
    name: string;
    status: string;
    flowJson: ApplicationFlowGraph;
    draftFlowJson: ApplicationFlowGraph | null;
    editorMode?: EditorMode;
  };
};

const { data, pending, error } = await useFetch<FlowResponse>(`/api/applications/flows/${flowId}`);

const {
  nodes,
  edges,
  saveStatus,
  publishStatus,
  hasUnpublishedChanges,
  canUndo,
  canRedo,
  loadGraph,
  onGraphChange,
  undo,
  redo,
  publishChanges,
  discardChanges,
  // Simple Mode
  editorMode,
  sections,
  loadSimpleMode,
  onSimpleSectionsChange,
  simpleCompatibility,
  switchToAdvanced,
  switchToSimple
} = useFlowBuilder(flowId);

// Load graph when data arrives — prefer draftFlowJson over flowJson
watch(data, (d) => {
  if (d?.flow) {
    const graph = d.flow.draftFlowJson ?? d.flow.flowJson;
    editorMode.value = d.flow.editorMode ?? "advanced";
    loadGraph(graph);
    hasUnpublishedChanges.value = d.flow.draftFlowJson !== null;

    // If simple mode, also parse into sections
    if (editorMode.value === "simple") {
      loadSimpleMode(graph);
    }
  }
}, { immediate: true });

// Selected node for sidebar / selected edge for deletion (Advanced Mode only)
const selectedNode = ref<Node | null>(null);
const selectedEdge = ref<Edge | null>(null);

function onNodeClick(node: Node) {
  selectedNode.value = node;
  selectedEdge.value = null;
}

function onEdgeClick(edge: Edge) {
  selectedEdge.value = edge;
  selectedNode.value = null;
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

function onUngroupNode(nodeId: string) {
  const node = nodes.value.find((n) => n.id === nodeId);
  if (!node || !node.parentNode) return;

  const parent = nodes.value.find((n) => n.id === node.parentNode);
  if (parent) {
    node.position = {
      x: node.position.x + parent.position.x,
      y: node.position.y + parent.position.y,
    };
  }
  node.parentNode = undefined;
  node.extent = undefined;
  onGraphChange();
}

function onDeleteNode(nodeId: string) {
  nodes.value = nodes.value.filter((n) => n.id !== nodeId && n.parentNode !== nodeId);
  edges.value = edges.value.filter((e) => e.source !== nodeId && e.target !== nodeId);
  selectedNode.value = null;
  onGraphChange();
}

// Mode switching
async function handleSwitchToSimple() {
  await switchToSimple();
  selectedNode.value = null;
  selectedEdge.value = null;
}

async function handleSwitchToAdvanced() {
  await switchToAdvanced();
}

// Simple Mode handlers
function onSimpleSectionsUpdate(newSections: typeof sections.value) {
  sections.value = newSections;
}

function onSimpleChange() {
  onSimpleSectionsChange();
}

function onSimpleUndo() {
  undo();
  // Re-parse sections from the restored graph
  const graph = { nodes: nodes.value.map((n) => ({ id: n.id, type: n.type as string, position: n.position, data: n.data, parentNode: n.parentNode, extent: n.extent as "parent" | undefined })), edges: edges.value.map((e) => ({ id: e.id, source: e.source, target: e.target, sourceHandle: e.sourceHandle, targetHandle: e.targetHandle })), version: 1 } as ApplicationFlowGraph;
  loadSimpleMode(graph);
}

function onSimpleRedo() {
  redo();
  const graph = { nodes: nodes.value.map((n) => ({ id: n.id, type: n.type as string, position: n.position, data: n.data, parentNode: n.parentNode, extent: n.extent as "parent" | undefined })), edges: edges.value.map((e) => ({ id: e.id, source: e.source, target: e.target, sourceHandle: e.sourceHandle, targetHandle: e.targetHandle })), version: 1 } as ApplicationFlowGraph;
  loadSimpleMode(graph);
}

// Keyboard shortcuts (Advanced Mode only)
function onKeydown(event: KeyboardEvent) {
  if (editorMode.value !== "advanced") return;

  if (event.key === "z" && (event.ctrlKey || event.metaKey)) {
    if (event.shiftKey) {
      redo();
    } else {
      undo();
    }
    event.preventDefault();
  }
  if (event.key === "Delete" || event.key === "Backspace") {
    if (selectedEdge.value) {
      edges.value = edges.value.filter((e) => e.id !== selectedEdge.value!.id);
      selectedEdge.value = null;
      onGraphChange();
    } else if (selectedNode.value && !["start"].includes(selectedNode.value.type || "")) {
      onDeleteNode(selectedNode.value.id);
    }
  }
}

// ─── Onboarding Tours ───────────────────────────────────────────────

const simpleTourSteps = computed<TourStep[]>(() => [
  {
    target: ".mode-toggle",
    title: t("applications.flowBuilder.tour.simple.modeToggle.title"),
    description: t("applications.flowBuilder.tour.simple.modeToggle.description"),
    placement: "bottom"
  },
  {
    target: ".simple-section__title",
    title: t("applications.flowBuilder.tour.simple.sectionTitle.title"),
    description: t("applications.flowBuilder.tour.simple.sectionTitle.description"),
    placement: "bottom"
  },
  {
    target: ".add-field-dropdown",
    title: t("applications.flowBuilder.tour.simple.addField.title"),
    description: t("applications.flowBuilder.tour.simple.addField.description"),
    placement: "top"
  },
  {
    target: ".simple-field__handle",
    title: t("applications.flowBuilder.tour.simple.dragDrop.title"),
    description: t("applications.flowBuilder.tour.simple.dragDrop.description"),
    placement: "right"
  },
  {
    target: ".simple-builder__toolbar-right",
    title: t("applications.flowBuilder.tour.simple.publish.title"),
    description: t("applications.flowBuilder.tour.simple.publish.description"),
    placement: "bottom"
  }
]);

const advancedTourSteps = computed<TourStep[]>(() => [
  {
    target: ".mode-toggle",
    title: t("applications.flowBuilder.tour.advanced.modeToggle.title"),
    description: t("applications.flowBuilder.tour.advanced.modeToggle.description"),
    placement: "bottom"
  },
  {
    target: ".flow-toolbar__nodes",
    title: t("applications.flowBuilder.tour.advanced.nodePalette.title"),
    description: t("applications.flowBuilder.tour.advanced.nodePalette.description"),
    placement: "right"
  },
  {
    target: ".vue-flow",
    title: t("applications.flowBuilder.tour.advanced.canvas.title"),
    description: t("applications.flowBuilder.tour.advanced.canvas.description"),
    placement: "left"
  },
  {
    target: ".flow-toolbar__publish",
    title: t("applications.flowBuilder.tour.advanced.publish.title"),
    description: t("applications.flowBuilder.tour.advanced.publish.description"),
    placement: "right"
  }
]);

const simpleTour = useOnboardingTour("flow_simple", simpleTourSteps.value, user.value?.id);
const advancedTour = useOnboardingTour("flow_advanced", advancedTourSteps.value, user.value?.id);

const activeTour = computed(() =>
  editorMode.value === "simple" ? simpleTour : advancedTour
);

function startTour() {
  activeTour.value.start();
}

function resetTour() {
  simpleTour.reset();
  advancedTour.reset();
  activeTour.value.start();
}

onMounted(() => {
  window.addEventListener("keydown", onKeydown);
});

// Start tour once data is loaded and content is rendered
watch(
  () => pending.value,
  (isPending) => {
    if (!isPending && data.value?.flow) {
      nextTick(() => activeTour.value.startIfNotSeen(300));
    }
  },
  { immediate: true }
);

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

      <!-- Mode toggle -->
      <div class="mode-toggle">
        <button
          class="mode-toggle__btn"
          :class="{ 'mode-toggle__btn--active': editorMode === 'simple' }"
          :disabled="editorMode === 'advanced' && !simpleCompatibility.compatible"
          :title="editorMode === 'advanced' && !simpleCompatibility.compatible ? t('applications.flowBuilder.modeSwitch.incompatible') : ''"
          @click="editorMode === 'simple' ? undefined : handleSwitchToSimple()"
        >
          {{ t("applications.flowBuilder.modeSwitch.simple") }}
        </button>
        <button
          class="mode-toggle__btn"
          :class="{ 'mode-toggle__btn--active': editorMode === 'advanced' }"
          @click="editorMode === 'advanced' ? undefined : handleSwitchToAdvanced()"
        >
          {{ t("applications.flowBuilder.modeSwitch.advanced") }}
        </button>
      </div>

      <button
        v-if="isDev"
        class="btn btn-ghost btn-sm ml-auto text-warning"
        title="Reset Tutorial (Dev)"
        @click="resetTour"
      >
        <Icon name="proicons:rotate" />
        <span class="text-xs">Reset Tour</span>
      </button>
      <button
        class="btn btn-ghost btn-sm"
        :class="{ 'ml-auto': !isDev }"
        :title="t('applications.flowBuilder.tour.help')"
        @click="startTour"
      >
        <Icon name="proicons:question-mark" />
      </button>
      <NuxtLink
        :to="`/applications/flows/${flowId}/settings`"
        class="btn btn-outline btn-sm"
      >
        {{ t("applications.actions.settings") }}
      </NuxtLink>
    </div>

    <!-- Builder body (client-only to avoid Vue Flow SSR hydration mismatches) -->
    <ClientOnly>
      <!-- Simple Mode -->
      <div v-if="editorMode === 'simple'" class="flow-builder__body">
        <ApplicationsFlowBuilderSimpleFormBuilder
          :sections="sections"
          :save-status="saveStatus"
          :publish-status="publishStatus"
          :has-unpublished-changes="hasUnpublishedChanges"
          :can-undo="canUndo"
          :can-redo="canRedo"
          @update:sections="onSimpleSectionsUpdate"
          @change="onSimpleChange"
          @undo="onSimpleUndo"
          @redo="onSimpleRedo"
          @publish="publishChanges"
          @discard="discardChanges"
        />
      </div>

      <!-- Advanced Mode -->
      <div v-else class="flow-builder__body">
        <ApplicationsFlowBuilderFlowToolbar
          :save-status="saveStatus"
          :publish-status="publishStatus"
          :has-unpublished-changes="hasUnpublishedChanges"
          :can-undo="canUndo"
          :can-redo="canRedo"
          @undo="undo"
          @redo="redo"
          @publish="publishChanges"
          @discard="discardChanges"
        />

        <ApplicationsFlowBuilderFlowCanvas
          :nodes="nodes"
          :edges="edges"
          @nodes-change="(n) => (nodes = n)"
          @edges-change="(e) => (edges = e)"
          @node-click="onNodeClick"
          @edge-click="onEdgeClick"
          @graph-change="onGraphChange"
        />

        <ApplicationsFlowBuilderFlowNodeSidebar
          v-if="selectedNode"
          :node="selectedNode"
          :nodes="nodes"
          @update-node-data="onUpdateNodeData"
          @delete-node="onDeleteNode"
          @ungroup-node="onUngroupNode"
          @close="onCloseSidebar"
        />
      </div>

      <template #fallback>
        <div class="flow-builder__body flex items-center justify-center">
          <span class="loading loading-spinner loading-md" />
        </div>
      </template>
    </ClientOnly>

    <!-- Onboarding Tour Overlay -->
    <ApplicationsFlowBuilderFlowBuilderTour
      :state="activeTour.state.value"
      @next="activeTour.next()"
      @skip="activeTour.skip()"
    />
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
  gap: 0.75rem;
}

.flow-builder__body {
  display: flex;
  flex: 1;
  min-height: 0;
}

/* Mode toggle */
.mode-toggle {
  display: flex;
  border-radius: 0.5rem;
  background: var(--color-surface-2);
  padding: 0.125rem;
  gap: 0.125rem;
}

.mode-toggle__btn {
  padding: 0.25rem 0.75rem;
  font-size: 0.8125rem;
  font-weight: 500;
  border-radius: 0.375rem;
  color: var(--color-base-content-secondary);
  cursor: pointer;
  transition: all 0.15s;
}

.mode-toggle__btn:hover:not(:disabled) {
  color: var(--color-base-content);
}

.mode-toggle__btn--active {
  background: var(--color-surface-1);
  color: var(--color-base-content);
  box-shadow: var(--shadow-sm);
}

.mode-toggle__btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
