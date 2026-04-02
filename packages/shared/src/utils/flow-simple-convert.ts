import type {
  ApplicationFlowGraph,
  FlowNode,
  FlowEdge,
  FlowInputNodeData,
  FlowInfoNodeData,
  FlowRoleAssignmentNodeData,
  FlowStepGroupNodeData,
  SimpleFormSection,
  SimpleFormItem
} from "../types/application-flow";

// ─── Layout Constants ──────────────────────────────────────────────────────

const GROUP_WIDTH = 400;
const ITEM_HEIGHT = 100;
const GROUP_PADDING_TOP = 60;
const GROUP_PADDING_BOTTOM = 40;
const GROUP_SPACING = 100;
const START_Y = 50;
const FIRST_GROUP_Y = 200;
const ITEM_X = 20;
const GROUP_X = 100;
const CENTER_X = 250;

// ─── Sections → Flow Graph ───��─────────────────────────────────────────────

/**
 * Converts a Simple Mode section list into a full ApplicationFlowGraph.
 * Produces start → step_group → ... → step_group → end with linear edges.
 * Node IDs from SimpleFormItem.id are preserved for stable round-tripping.
 */
export function sectionsToFlowGraph(sections: SimpleFormSection[]): ApplicationFlowGraph {
  const nodes: FlowNode[] = [];
  const edges: FlowEdge[] = [];

  // Start node
  nodes.push({ id: "start", type: "start", position: { x: CENTER_X, y: START_Y }, data: {} });

  let currentY = FIRST_GROUP_Y;
  let previousNodeId = "start";

  for (const section of sections) {
    const groupHeight = GROUP_PADDING_TOP + section.items.length * ITEM_HEIGHT + GROUP_PADDING_BOTTOM;

    // Step group node
    nodes.push({
      id: section.id,
      type: "step_group",
      position: { x: GROUP_X, y: currentY },
      width: GROUP_WIDTH,
      height: groupHeight,
      data: { title: section.title } as FlowStepGroupNodeData
    });

    // Child nodes within the group
    for (let i = 0; i < section.items.length; i++) {
      const item = section.items[i];
      nodes.push({
        id: item.id,
        type: item.type,
        position: { x: ITEM_X, y: GROUP_PADDING_TOP + i * ITEM_HEIGHT },
        parentNode: section.id,
        extent: "parent",
        data: item.data
      });
    }

    // Edge from previous to this group
    edges.push({
      id: `e_${previousNodeId}_${section.id}`,
      source: previousNodeId,
      target: section.id
    });

    previousNodeId = section.id;
    currentY += groupHeight + GROUP_SPACING;
  }

  // End node
  nodes.push({ id: "end", type: "end", position: { x: CENTER_X, y: currentY }, data: {} });
  edges.push({
    id: `e_${previousNodeId}_end`,
    source: previousNodeId,
    target: "end"
  });

  return { nodes, edges, version: 1 };
}

// ─── Flow Graph → Sections ───��─────────────────────────────────────────────

/**
 * Converts a flow graph back into Simple Mode sections.
 * Returns null if the graph contains incompatible elements.
 */
export function flowGraphToSections(graph: ApplicationFlowGraph): SimpleFormSection[] | null {
  const check = canConvertToSimple(graph);
  if (!check.compatible) return null;

  const nodeMap = new Map<string, FlowNode>();
  for (const node of graph.nodes) {
    nodeMap.set(node.id, node);
  }

  // Build outgoing edge map
  const outgoing = new Map<string, FlowEdge[]>();
  for (const edge of graph.edges) {
    if (!outgoing.has(edge.source)) outgoing.set(edge.source, []);
    outgoing.get(edge.source)!.push(edge);
  }

  // Collect children per parent
  const children = new Map<string, FlowNode[]>();
  for (const node of graph.nodes) {
    if (node.parentNode) {
      if (!children.has(node.parentNode)) children.set(node.parentNode, []);
      children.get(node.parentNode)!.push(node);
    }
  }

  // Walk the linear chain from start
  const startNode = graph.nodes.find((n) => n.type === "start");
  if (!startNode) return null;

  const sections: SimpleFormSection[] = [];
  let currentId: string | null = startNode.id;
  const visited = new Set<string>();

  while (currentId && !visited.has(currentId)) {
    visited.add(currentId);
    const node = nodeMap.get(currentId);
    if (!node) break;

    if (node.type === "step_group") {
      const groupData = node.data as FlowStepGroupNodeData;
      const groupChildren = children.get(node.id) ?? [];

      // Sort children by Y position
      const sorted = [...groupChildren].sort((a, b) => a.position.y - b.position.y);

      const items: SimpleFormItem[] = sorted
        .filter((child) => child.type === "input" || child.type === "info" || child.type === "role_assignment")
        .map((child) => ({
          id: child.id,
          type: child.type as SimpleFormItem["type"],
          data: child.data as FlowInputNodeData | FlowInfoNodeData | FlowRoleAssignmentNodeData
        }));

      sections.push({
        id: node.id,
        title: groupData.title ?? "",
        items
      });
    }

    // Follow to next node
    const edgesOut = outgoing.get(currentId);
    currentId = edgesOut && edgesOut.length > 0 ? edgesOut[0].target : null;
  }

  return sections;
}

// ─── Compatibility Check ───────────────────────────────────────────────────

export interface SimpleCompatibilityResult {
  compatible: boolean;
  reasons: string[];
}

/**
 * Checks whether a flow graph can be represented in Simple Mode.
 * Returns incompatibility reasons as i18n-ready keys.
 */
export function canConvertToSimple(graph: ApplicationFlowGraph): SimpleCompatibilityResult {
  const reasons: string[] = [];

  // Check for conditional_branch nodes
  if (graph.nodes.some((n) => n.type === "conditional_branch")) {
    reasons.push("hasBranches");
  }

  // Check for abort nodes
  if (graph.nodes.some((n) => n.type === "abort")) {
    reasons.push("hasAbort");
  }

  // Build outgoing edge counts
  const outgoingCount = new Map<string, number>();
  for (const edge of graph.edges) {
    outgoingCount.set(edge.source, (outgoingCount.get(edge.source) ?? 0) + 1);
  }

  // Check for non-linear edges (any node with >1 outgoing edge)
  for (const [nodeId, count] of outgoingCount) {
    if (count > 1) {
      reasons.push("nonLinear");
      break;
    }
  }

  // Check for free-floating nodes (not start/end/step_group, and not inside a group)
  for (const node of graph.nodes) {
    if (node.type === "start" || node.type === "end" || node.type === "step_group") continue;
    if (!node.parentNode) {
      reasons.push("freeFloatingNodes");
      break;
    }
  }

  return { compatible: reasons.length === 0, reasons };
}
