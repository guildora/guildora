import { describe, it, expect, beforeEach } from "vitest";
import {
  sectionsToFlowGraph,
  flowGraphToSections,
  canConvertToSimple,
} from "../flow-simple-convert";
import {
  resetFactoryCounters,
  buildBranchingFlowGraph,
  buildFlowGraphWithAbort,
} from "../../test-utils/factories";
import type {
  FlowInputNodeData,
  FlowInfoNodeData,
  FlowRoleAssignmentNodeData,
  SimpleFormSection,
} from "../../types/application-flow";

describe("sectionsToFlowGraph", () => {
  beforeEach(() => {
    resetFactoryCounters();
  });

  it("creates a valid graph from empty sections", () => {
    const graph = sectionsToFlowGraph([]);

    expect(graph.nodes).toHaveLength(2); // start + end
    expect(graph.edges).toHaveLength(1); // start → end
    expect(graph.nodes[0].type).toBe("start");
    expect(graph.nodes[1].type).toBe("end");
    expect(graph.version).toBe(1);
  });

  it("creates a graph from a single section with one input item", () => {
    const sections: SimpleFormSection[] = [
      {
        id: "section_1",
        title: "About You",
        items: [
          {
            id: "field_name",
            type: "input",
            data: {
              inputType: "short_text",
              label: "Your Name",
              required: true,
            } as FlowInputNodeData,
          },
        ],
      },
    ];

    const graph = sectionsToFlowGraph(sections);

    // start + step_group + child_input + end = 4 nodes
    expect(graph.nodes).toHaveLength(4);
    // start→group, group→end = 2 edges
    expect(graph.edges).toHaveLength(2);

    const group = graph.nodes.find((n) => n.type === "step_group")!;
    expect(group.id).toBe("section_1");
    expect(group.data).toEqual({ title: "About You" });

    const input = graph.nodes.find((n) => n.id === "field_name")!;
    expect(input.parentNode).toBe("section_1");
    expect(input.type).toBe("input");
  });

  it("creates correct edges for multiple sections", () => {
    const sections: SimpleFormSection[] = [
      {
        id: "s1",
        title: "Section 1",
        items: [
          {
            id: "f1",
            type: "input",
            data: { inputType: "short_text", label: "Field 1", required: false } as FlowInputNodeData,
          },
        ],
      },
      {
        id: "s2",
        title: "Section 2",
        items: [
          {
            id: "f2",
            type: "input",
            data: { inputType: "email", label: "Email", required: true } as FlowInputNodeData,
          },
        ],
      },
    ];

    const graph = sectionsToFlowGraph(sections);

    // start + s1_group + s1_child + s2_group + s2_child + end = 6
    expect(graph.nodes).toHaveLength(6);
    // start→s1, s1→s2, s2→end = 3
    expect(graph.edges).toHaveLength(3);

    const edgeSources = graph.edges.map((e) => e.source);
    expect(edgeSources).toContain("start");
    expect(edgeSources).toContain("s1");
    expect(edgeSources).toContain("s2");
  });

  it("preserves item IDs for stable round-tripping", () => {
    const sections: SimpleFormSection[] = [
      {
        id: "sec_1",
        title: "Test",
        items: [
          {
            id: "my_custom_id",
            type: "input",
            data: { inputType: "short_text", label: "A", required: false } as FlowInputNodeData,
          },
        ],
      },
    ];

    const graph = sectionsToFlowGraph(sections);
    const child = graph.nodes.find((n) => n.id === "my_custom_id");
    expect(child).toBeDefined();
    expect(child!.parentNode).toBe("sec_1");
  });

  it("sets correct dimensions and positions for step groups", () => {
    const sections: SimpleFormSection[] = [
      {
        id: "s1",
        title: "Test",
        items: [
          { id: "f1", type: "input", data: { inputType: "short_text", label: "A", required: false } as FlowInputNodeData },
          { id: "f2", type: "input", data: { inputType: "short_text", label: "B", required: false } as FlowInputNodeData },
        ],
      },
    ];

    const graph = sectionsToFlowGraph(sections);
    const group = graph.nodes.find((n) => n.type === "step_group")!;

    expect(group.width).toBe(400);
    // GROUP_PADDING_TOP(60) + 2*ITEM_HEIGHT(100) + GROUP_PADDING_BOTTOM(40) = 300
    expect(group.height).toBe(300);
  });
});

describe("flowGraphToSections", () => {
  it("returns null for a graph with branching (incompatible)", () => {
    const graph = buildBranchingFlowGraph();
    const result = flowGraphToSections(graph);
    expect(result).toBeNull();
  });

  it("returns null for a graph with abort nodes", () => {
    const graph = buildFlowGraphWithAbort();
    const result = flowGraphToSections(graph);
    expect(result).toBeNull();
  });

  it("round-trips: sections → graph → sections preserves data", () => {
    const original: SimpleFormSection[] = [
      {
        id: "about",
        title: "About You",
        items: [
          {
            id: "name_field",
            type: "input",
            data: {
              inputType: "short_text",
              label: "Name",
              required: true,
            } as FlowInputNodeData,
          },
          {
            id: "info_field",
            type: "info",
            data: {
              markdown: "Please fill in your details",
            } as FlowInfoNodeData,
          },
        ],
      },
      {
        id: "roles",
        title: "Role Assignment",
        items: [
          {
            id: "role_item",
            type: "role_assignment",
            data: {
              roleIds: ["r1"],
              roleNameSnapshots: ["Member"],
            } as FlowRoleAssignmentNodeData,
          },
        ],
      },
    ];

    const graph = sectionsToFlowGraph(original);
    const recovered = flowGraphToSections(graph);

    expect(recovered).not.toBeNull();
    expect(recovered).toHaveLength(2);
    expect(recovered![0].id).toBe("about");
    expect(recovered![0].title).toBe("About You");
    expect(recovered![0].items).toHaveLength(2);
    expect(recovered![0].items[0].id).toBe("name_field");
    expect(recovered![0].items[0].type).toBe("input");
    expect(recovered![1].id).toBe("roles");
    expect(recovered![1].items[0].type).toBe("role_assignment");
  });

  it("returns empty array for minimal start→end graph", () => {
    const graph = sectionsToFlowGraph([]);
    const sections = flowGraphToSections(graph);
    expect(sections).toEqual([]);
  });

  it("sorts children by Y position", () => {
    const sections: SimpleFormSection[] = [
      {
        id: "s1",
        title: "Test",
        items: [
          { id: "a", type: "input", data: { inputType: "short_text", label: "First", required: false } as FlowInputNodeData },
          { id: "b", type: "input", data: { inputType: "short_text", label: "Second", required: false } as FlowInputNodeData },
        ],
      },
    ];

    const graph = sectionsToFlowGraph(sections);
    // Swap Y positions
    const nodeA = graph.nodes.find((n) => n.id === "a")!;
    const nodeB = graph.nodes.find((n) => n.id === "b")!;
    const tmpY = nodeA.position.y;
    nodeA.position.y = nodeB.position.y;
    nodeB.position.y = tmpY;

    const recovered = flowGraphToSections(graph);
    expect(recovered![0].items[0].id).toBe("b");
    expect(recovered![0].items[1].id).toBe("a");
  });
});

describe("canConvertToSimple", () => {
  it("returns compatible for a linear step_group graph", () => {
    const graph = sectionsToFlowGraph([
      {
        id: "s1",
        title: "Test",
        items: [
          { id: "f1", type: "input", data: { inputType: "short_text", label: "Name", required: true } as FlowInputNodeData },
        ],
      },
    ]);

    const result = canConvertToSimple(graph);
    expect(result.compatible).toBe(true);
    expect(result.reasons).toEqual([]);
  });

  it("rejects graphs with conditional_branch nodes", () => {
    const graph = buildBranchingFlowGraph();
    const result = canConvertToSimple(graph);

    expect(result.compatible).toBe(false);
    expect(result.reasons).toContain("hasBranches");
  });

  it("rejects graphs with abort nodes", () => {
    const graph = buildFlowGraphWithAbort();
    const result = canConvertToSimple(graph);

    expect(result.compatible).toBe(false);
    expect(result.reasons).toContain("hasAbort");
  });

  it("rejects graphs with non-linear edges", () => {
    const graph = buildBranchingFlowGraph();
    const result = canConvertToSimple(graph);

    expect(result.compatible).toBe(false);
    expect(result.reasons).toContain("nonLinear");
  });

  it("rejects graphs with free-floating input nodes", () => {
    const graph = sectionsToFlowGraph([]);
    graph.nodes.push({
      id: "floating",
      type: "input",
      position: { x: 0, y: 0 },
      data: { inputType: "short_text", label: "Float", required: false } as FlowInputNodeData,
    });

    const result = canConvertToSimple(graph);
    expect(result.compatible).toBe(false);
    expect(result.reasons).toContain("freeFloatingNodes");
  });

  it("returns compatible for empty graph (start → end only)", () => {
    const graph = sectionsToFlowGraph([]);
    const result = canConvertToSimple(graph);
    expect(result.compatible).toBe(true);
  });

  it("can collect multiple incompatibility reasons", () => {
    const graph = buildBranchingFlowGraph();
    // Also add an abort node
    graph.nodes.push({
      id: "abort_extra",
      type: "abort",
      position: { x: 0, y: 0 },
      data: { message: "stop" },
    });

    const result = canConvertToSimple(graph);
    expect(result.compatible).toBe(false);
    expect(result.reasons).toContain("hasBranches");
    expect(result.reasons).toContain("hasAbort");
    expect(result.reasons).toContain("nonLinear");
  });
});
