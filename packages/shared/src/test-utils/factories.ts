/**
 * Test data factories for Guildora entities.
 * Generates deterministic test data without external dependencies.
 */

import type {
  ApplicationFlowGraph,
  FlowInputNodeData,
  FlowInfoNodeData,
  FlowRoleAssignmentNodeData,
  SimpleFormSection,
} from "../types/application-flow";

// ─── Counters for unique IDs ────────────────────────────────────────────────

let idCounter = 0;

export function resetFactoryCounters() {
  idCounter = 0;
}

function nextId(prefix: string): string {
  return `${prefix}_${++idCounter}`;
}

// ─── User Factory ────────────────────────────────────────────────────────────

export interface UserFactoryInput {
  id?: string;
  discordId?: string;
  email?: string | null;
  displayName?: string;
  avatarUrl?: string | null;
}

export function buildUser(overrides?: UserFactoryInput) {
  const id = overrides?.id ?? nextId("user");
  return {
    id,
    discordId: overrides?.discordId ?? nextId("discord"),
    email: overrides?.email ?? `${id}@test.guildora.dev`,
    displayName: overrides?.displayName ?? `TestUser_${id}`,
    avatarUrl: overrides?.avatarUrl ?? null,
  };
}

// ─── Profile Factory ─────────────────────────────────────────────────────────

export interface ProfileFactoryInput {
  id?: string;
  userId?: string;
  customFields?: Record<string, unknown>;
  localePreference?: string | null;
}

export function buildProfile(overrides?: ProfileFactoryInput) {
  const id = overrides?.id ?? nextId("profile");
  return {
    id,
    userId: overrides?.userId ?? nextId("user"),
    customFields: overrides?.customFields ?? {},
    localePreference: overrides?.localePreference ?? null,
  };
}

// ─── Application Flow Graph Factories ────────────────────────────────────────

export function buildMinimalFlowGraph(): ApplicationFlowGraph {
  return {
    nodes: [
      { id: "start", type: "start", position: { x: 0, y: 0 }, data: {} },
      { id: "end", type: "end", position: { x: 0, y: 200 }, data: {} },
    ],
    edges: [{ id: "e_start_end", source: "start", target: "end" }],
    version: 1,
  };
}

export function buildLinearFlowGraph(): ApplicationFlowGraph {
  return {
    nodes: [
      { id: "start", type: "start", position: { x: 0, y: 0 }, data: {} },
      {
        id: "input_1",
        type: "input",
        position: { x: 0, y: 100 },
        data: {
          inputType: "short_text",
          label: "Your Name",
          required: true,
        } as FlowInputNodeData,
      },
      {
        id: "info_1",
        type: "info",
        position: { x: 0, y: 200 },
        data: {
          markdown: "Thank you for applying!",
        } as FlowInfoNodeData,
      },
      { id: "end", type: "end", position: { x: 0, y: 300 }, data: {} },
    ],
    edges: [
      { id: "e1", source: "start", target: "input_1" },
      { id: "e2", source: "input_1", target: "info_1" },
      { id: "e3", source: "info_1", target: "end" },
    ],
    version: 1,
  };
}

export function buildBranchingFlowGraph(): ApplicationFlowGraph {
  return {
    nodes: [
      { id: "start", type: "start", position: { x: 0, y: 0 }, data: {} },
      {
        id: "input_choice",
        type: "input",
        position: { x: 0, y: 100 },
        data: {
          inputType: "single_select_radio",
          label: "Choose path",
          required: true,
          options: [
            { id: "opt_a", label: "Path A" },
            { id: "opt_b", label: "Path B" },
          ],
        } as FlowInputNodeData,
      },
      {
        id: "branch_1",
        type: "conditional_branch",
        position: { x: 0, y: 200 },
        data: {
          sourceNodeId: "input_choice",
          branches: [
            { optionId: "opt_a", label: "Path A", handleId: "handle_a" },
            { optionId: "opt_b", label: "Path B", handleId: "handle_b" },
          ],
          defaultHandleId: "handle_default",
        },
      },
      {
        id: "info_a",
        type: "info",
        position: { x: -100, y: 300 },
        data: { markdown: "You chose Path A" } as FlowInfoNodeData,
      },
      {
        id: "info_b",
        type: "info",
        position: { x: 100, y: 300 },
        data: { markdown: "You chose Path B" } as FlowInfoNodeData,
      },
      { id: "end", type: "end", position: { x: 0, y: 400 }, data: {} },
    ],
    edges: [
      { id: "e1", source: "start", target: "input_choice" },
      { id: "e2", source: "input_choice", target: "branch_1" },
      { id: "e3", source: "branch_1", target: "info_a", sourceHandle: "handle_a" },
      { id: "e4", source: "branch_1", target: "info_b", sourceHandle: "handle_b" },
      { id: "e5", source: "info_a", target: "end" },
      { id: "e6", source: "info_b", target: "end" },
    ],
    version: 1,
  };
}

export function buildStepGroupFlowGraph(): ApplicationFlowGraph {
  return {
    nodes: [
      { id: "start", type: "start", position: { x: 0, y: 0 }, data: {} },
      {
        id: "group_1",
        type: "step_group",
        position: { x: 0, y: 100 },
        width: 400,
        height: 300,
        data: { title: "Personal Info" },
      },
      {
        id: "field_name",
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
        id: "field_email",
        type: "input",
        position: { x: 20, y: 160 },
        parentNode: "group_1",
        extent: "parent",
        data: {
          inputType: "email",
          label: "Email",
          required: true,
        } as FlowInputNodeData,
      },
      { id: "end", type: "end", position: { x: 0, y: 500 }, data: {} },
    ],
    edges: [
      { id: "e1", source: "start", target: "group_1" },
      { id: "e2", source: "group_1", target: "end" },
    ],
    version: 1,
  };
}

export function buildFlowGraphWithAbort(): ApplicationFlowGraph {
  return {
    nodes: [
      { id: "start", type: "start", position: { x: 0, y: 0 }, data: {} },
      {
        id: "abort_1",
        type: "abort",
        position: { x: 0, y: 100 },
        data: { message: "Applications are closed" },
      },
    ],
    edges: [{ id: "e1", source: "start", target: "abort_1" }],
    version: 1,
  };
}

export function buildFlowGraphWithRoleAssignment(): ApplicationFlowGraph {
  return {
    nodes: [
      { id: "start", type: "start", position: { x: 0, y: 0 }, data: {} },
      {
        id: "role_1",
        type: "role_assignment",
        position: { x: 0, y: 100 },
        data: {
          roleIds: ["role_123", "role_456"],
          roleNameSnapshots: ["Member", "Verified"],
        } as FlowRoleAssignmentNodeData,
      },
      { id: "end", type: "end", position: { x: 0, y: 200 }, data: {} },
    ],
    edges: [
      { id: "e1", source: "start", target: "role_1" },
      { id: "e2", source: "role_1", target: "end" },
    ],
    version: 1,
  };
}

// ─── Session User Factory ───────────────────────────────────────────────────

export type PermissionRole = "temporaer" | "user" | "moderator" | "admin" | "superadmin";

export interface SessionUserFactoryInput {
  id?: string;
  discordId?: string;
  profileName?: string;
  avatarUrl?: string | null;
  permissionRoles?: PermissionRole[];
  communityRole?: string | null;
}

export function buildSessionUser(
  role: PermissionRole | PermissionRole[],
  overrides?: SessionUserFactoryInput
) {
  const roles = Array.isArray(role) ? role : [role];
  const id = overrides?.id ?? nextId("session-user");
  return {
    id,
    discordId: overrides?.discordId ?? nextId("discord"),
    profileName: overrides?.profileName ?? `TestUser_${id}`,
    avatarUrl: overrides?.avatarUrl ?? null,
    permissionRoles: roles,
    communityRole: overrides?.communityRole ?? null,
    moderationRights: {
      modDeleteUsers: false,
      modManageApplications: false,
      modAccessCommunitySettings: false,
      modAccessDesign: false,
      modAccessApps: false,
      modAccessDiscordRoles: false,
    },
  };
}

// ─── Simple Form Section Factory ─────────────────────────────────────────────

export function buildSimpleFormSection(
  overrides?: Partial<SimpleFormSection>
): SimpleFormSection {
  const id = overrides?.id ?? nextId("section");
  return {
    id,
    title: overrides?.title ?? `Section ${id}`,
    items: overrides?.items ?? [
      {
        id: nextId("item"),
        type: "input",
        data: {
          inputType: "short_text",
          label: "Default Field",
          required: false,
        } as FlowInputNodeData,
      },
    ],
  };
}
