import { describe, it, expect, beforeEach } from "vitest";
import { linearizeFlowGraph } from "../flow-linearize";
import {
  resetFactoryCounters,
  buildMinimalFlowGraph,
  buildLinearFlowGraph,
  buildBranchingFlowGraph,
  buildStepGroupFlowGraph,
  buildFlowGraphWithAbort,
  buildFlowGraphWithRoleAssignment,
} from "../../test-utils/factories";
import type {
  ApplicationFlowGraph,
  FlowInputNodeData,
  FlowRoleAssignmentNodeData,
} from "../../types/application-flow";

describe("linearizeFlowGraph", () => {
  beforeEach(() => {
    resetFactoryCounters();
  });

  it("returns empty steps for a graph with no start node", () => {
    const graph: ApplicationFlowGraph = { nodes: [], edges: [], version: 1 };
    const result = linearizeFlowGraph(graph);

    expect(result.steps).toEqual([]);
    expect(result.collectedRoleIds).toEqual([]);
    expect(result.reachedEnd).toBe(false);
  });

  it("handles a minimal start → end graph", () => {
    const graph = buildMinimalFlowGraph();
    const result = linearizeFlowGraph(graph);

    expect(result.steps).toEqual([]);
    expect(result.collectedRoleIds).toEqual([]);
    expect(result.reachedEnd).toBe(true);
  });

  it("linearizes a simple start → input → info → end graph", () => {
    const graph = buildLinearFlowGraph();
    const result = linearizeFlowGraph(graph);

    expect(result.steps).toHaveLength(2);
    expect(result.steps[0].type).toBe("input");
    expect(result.steps[0].fields).toHaveLength(1);
    expect(result.steps[0].fields![0].label).toBe("Your Name");
    expect(result.steps[0].fields![0].required).toBe(true);
    expect(result.steps[1].type).toBe("info");
    expect(result.steps[1].infoData?.markdown).toBe("Thank you for applying!");
    expect(result.reachedEnd).toBe(true);
  });

  it("terminates on abort node with message", () => {
    const graph = buildFlowGraphWithAbort();
    const result = linearizeFlowGraph(graph);

    expect(result.steps).toHaveLength(1);
    expect(result.steps[0].type).toBe("abort");
    expect(result.steps[0].abortMessage).toBe("Applications are closed");
    expect(result.abortMessage).toBe("Applications are closed");
    expect(result.reachedEnd).toBe(false);
  });

  it("collects role IDs from role_assignment nodes", () => {
    const graph = buildFlowGraphWithRoleAssignment();
    const result = linearizeFlowGraph(graph);

    expect(result.collectedRoleIds).toEqual(["role_123", "role_456"]);
    expect(result.steps).toHaveLength(0);
    expect(result.reachedEnd).toBe(true);
  });

  it("groups step_group children into a single input_group step", () => {
    const graph = buildStepGroupFlowGraph();
    const result = linearizeFlowGraph(graph);

    expect(result.steps).toHaveLength(1);
    expect(result.steps[0].type).toBe("input_group");
    expect(result.steps[0].fields).toHaveLength(2);
    expect(result.steps[0].fields![0].label).toBe("Name");
    expect(result.steps[0].fields![1].label).toBe("Email");
    expect(result.steps[0].nodeIds).toContain("group_1");
    expect(result.steps[0].nodeIds).toContain("field_name");
    expect(result.steps[0].nodeIds).toContain("field_email");
    expect(result.reachedEnd).toBe(true);
  });

  it("sorts step_group children by Y position", () => {
    const graph = buildStepGroupFlowGraph();
    // Swap Y positions so email comes before name
    const nameNode = graph.nodes.find((n) => n.id === "field_name")!;
    const emailNode = graph.nodes.find((n) => n.id === "field_email")!;
    nameNode.position.y = 200;
    emailNode.position.y = 60;

    const result = linearizeFlowGraph(graph);
    expect(result.steps[0].fields![0].label).toBe("Email");
    expect(result.steps[0].fields![1].label).toBe("Name");
  });

  describe("conditional branching", () => {
    it("follows first branch when no answers provided", () => {
      const graph = buildBranchingFlowGraph();
      const result = linearizeFlowGraph(graph);

      expect(result.steps).toHaveLength(2);
      expect(result.steps[0].type).toBe("input");
      expect(result.steps[1].type).toBe("info");
      // Without answers, follows first edge (Path A)
      expect(result.steps[1].infoData?.markdown).toBe("You chose Path A");
      expect(result.reachedEnd).toBe(true);
    });

    it("follows correct branch based on answer (opt_a)", () => {
      const graph = buildBranchingFlowGraph();
      const result = linearizeFlowGraph(graph, { input_choice: "opt_a" });

      expect(result.steps[1].infoData?.markdown).toBe("You chose Path A");
      expect(result.reachedEnd).toBe(true);
    });

    it("follows correct branch based on answer (opt_b)", () => {
      const graph = buildBranchingFlowGraph();
      const result = linearizeFlowGraph(graph, { input_choice: "opt_b" });

      expect(result.steps[1].infoData?.markdown).toBe("You chose Path B");
      expect(result.reachedEnd).toBe(true);
    });

    it("handles array answers for branch matching", () => {
      const graph = buildBranchingFlowGraph();
      const result = linearizeFlowGraph(graph, {
        input_choice: ["opt_b", "opt_c"],
      });

      expect(result.steps[1].infoData?.markdown).toBe("You chose Path B");
    });

    it("falls back to default handle when answer doesn't match any branch", () => {
      const graph = buildBranchingFlowGraph();
      // Add a default edge
      graph.nodes.push({
        id: "info_default",
        type: "info",
        position: { x: 0, y: 300 },
        data: { markdown: "Default path" },
      });
      graph.edges.push({
        id: "e_default",
        source: "branch_1",
        target: "info_default",
        sourceHandle: "handle_default",
      });
      graph.edges.push({
        id: "e_default_end",
        source: "info_default",
        target: "end",
      });

      const result = linearizeFlowGraph(graph, { input_choice: "unknown" });
      expect(result.steps[1].infoData?.markdown).toBe("Default path");
    });
  });

  it("skips input nodes that are children of a step_group", () => {
    // When an input node has parentNode set, it should be skipped
    // during the main traversal (handled by the step_group processing)
    const graph = buildStepGroupFlowGraph();
    const result = linearizeFlowGraph(graph);

    // Should only have 1 step (the group), not individual input steps
    expect(result.steps).toHaveLength(1);
    expect(result.steps[0].type).toBe("input_group");
  });

  it("prevents infinite loops via visited set", () => {
    const graph: ApplicationFlowGraph = {
      nodes: [
        { id: "start", type: "start", position: { x: 0, y: 0 }, data: {} },
        {
          id: "input_1",
          type: "input",
          position: { x: 0, y: 100 },
          data: {
            inputType: "short_text",
            label: "Loop",
            required: false,
          } as FlowInputNodeData,
        },
      ],
      edges: [
        { id: "e1", source: "start", target: "input_1" },
        { id: "e2", source: "input_1", target: "input_1" }, // self-loop
      ],
      version: 1,
    };

    const result = linearizeFlowGraph(graph);
    expect(result.steps).toHaveLength(1);
    expect(result.reachedEnd).toBe(false);
  });

  it("handles disconnected graph (no edge from start)", () => {
    const graph: ApplicationFlowGraph = {
      nodes: [
        { id: "start", type: "start", position: { x: 0, y: 0 }, data: {} },
        { id: "end", type: "end", position: { x: 0, y: 200 }, data: {} },
      ],
      edges: [], // no edges
      version: 1,
    };

    const result = linearizeFlowGraph(graph);
    expect(result.steps).toEqual([]);
    expect(result.reachedEnd).toBe(false);
  });

  it("collects role IDs from role_assignment inside step_groups", () => {
    const graph: ApplicationFlowGraph = {
      nodes: [
        { id: "start", type: "start", position: { x: 0, y: 0 }, data: {} },
        {
          id: "group_1",
          type: "step_group",
          position: { x: 0, y: 100 },
          width: 400,
          height: 300,
          data: { title: "Step" },
        },
        {
          id: "field_1",
          type: "input",
          position: { x: 20, y: 60 },
          parentNode: "group_1",
          extent: "parent",
          data: {
            inputType: "short_text",
            label: "Name",
            required: true,
          } as FlowInputNodeData,
        },
        {
          id: "role_inside",
          type: "role_assignment",
          position: { x: 20, y: 160 },
          parentNode: "group_1",
          extent: "parent",
          data: {
            roleIds: ["role_inside_group"],
            roleNameSnapshots: ["Inside"],
          } as FlowRoleAssignmentNodeData,
        },
        { id: "end", type: "end", position: { x: 0, y: 500 }, data: {} },
      ],
      edges: [
        { id: "e1", source: "start", target: "group_1" },
        { id: "e2", source: "group_1", target: "end" },
      ],
      version: 1,
    };

    const result = linearizeFlowGraph(graph);
    expect(result.collectedRoleIds).toContain("role_inside_group");
    expect(result.steps).toHaveLength(1);
    expect(result.steps[0].fields).toHaveLength(1);
  });

  it("maps all input field properties correctly", () => {
    const graph: ApplicationFlowGraph = {
      nodes: [
        { id: "start", type: "start", position: { x: 0, y: 0 }, data: {} },
        {
          id: "input_full",
          type: "input",
          position: { x: 0, y: 100 },
          data: {
            inputType: "single_select_dropdown",
            label: "Choose class",
            description: "Pick your class",
            placeholder: "Select...",
            required: true,
            options: [
              { id: "opt1", label: "Tank" },
              { id: "opt2", label: "Healer" },
            ],
            validation: { minSelections: 1 },
          } as FlowInputNodeData,
        },
        { id: "end", type: "end", position: { x: 0, y: 200 }, data: {} },
      ],
      edges: [
        { id: "e1", source: "start", target: "input_full" },
        { id: "e2", source: "input_full", target: "end" },
      ],
      version: 1,
    };

    const result = linearizeFlowGraph(graph);
    const field = result.steps[0].fields![0];
    expect(field.nodeId).toBe("input_full");
    expect(field.inputType).toBe("single_select_dropdown");
    expect(field.label).toBe("Choose class");
    expect(field.description).toBe("Pick your class");
    expect(field.placeholder).toBe("Select...");
    expect(field.required).toBe(true);
    expect(field.options).toHaveLength(2);
    expect(field.validation).toEqual({ minSelections: 1 });
  });
});
