// ─── Flow Node & Edge Types ─────────────────────────────────────────────────

export type FlowInputType =
  | "short_text"
  | "long_text"
  | "number"
  | "email"
  | "single_select_radio"
  | "single_select_dropdown"
  | "multi_select"
  | "yes_no"
  | "date"
  | "file_upload"
  | "discord_username"
  | "discord_role_single"
  | "discord_role_multi";

export type FlowNodeType =
  | "start"
  | "end"
  | "input"
  | "info"
  | "conditional_branch"
  | "abort"
  | "role_assignment"
  | "step_group";

export interface FlowNodePosition {
  x: number;
  y: number;
}

// ─── Per-Node Data Interfaces ───────────────────────────────────────────────

export interface FlowInputNodeData {
  inputType: FlowInputType;
  label: string;
  description?: string;
  placeholder?: string;
  required: boolean;
  /** For select/radio/checkbox types: the available options */
  options?: Array<{ id: string; label: string }>;
  /** For discord_role_single / discord_role_multi: the selectable roles */
  discordRoleOptions?: Array<{
    roleId: string;
    name: string;
    color: number;
    unicodeEmoji?: string | null;
  }>;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    minValue?: number;
    maxValue?: number;
    integerOnly?: boolean;
    minSelections?: number;
    maxSelections?: number;
    maxFileSize?: number;
    allowedFileTypes?: string[];
    pastOnly?: boolean;
    futureOnly?: boolean;
  };
}

export interface FlowInfoNodeData {
  markdown: string;
  ctaLabel?: string;
  ctaUrl?: string;
  ctaLinkText?: string;
  ctaLinkUrl?: string;
}

export interface FlowConditionalBranchNodeData {
  /** Which input node's answer to branch on */
  sourceNodeId: string;
  /** Each branch maps an option to a specific output handle */
  branches: Array<{ optionId: string; label: string; handleId: string }>;
  /** Handle id for answers that don't match any branch */
  defaultHandleId?: string;
}

export interface FlowAbortNodeData {
  message: string;
}

export interface FlowRoleAssignmentNodeData {
  /** Array of Discord role IDs to assign when this node is in the traversed path */
  roleIds: string[];
  /** Snapshot of role names for display purposes */
  roleNameSnapshots: string[];
}

export interface FlowStepGroupNodeData {
  title: string;
  description?: string;
}

export type FlowNodeData =
  | FlowInputNodeData
  | FlowInfoNodeData
  | FlowConditionalBranchNodeData
  | FlowAbortNodeData
  | FlowRoleAssignmentNodeData
  | FlowStepGroupNodeData
  | Record<string, never>; // start/end nodes have empty data

// ─── Graph Structure ────────────────────────────────────────────────────────

export interface FlowNode {
  id: string;
  type: FlowNodeType;
  position: FlowNodePosition;
  data: FlowNodeData;
  /** For nodes inside a StepGroup — references the group node's id */
  parentNode?: string;
  extent?: "parent";
  /** Persisted dimensions for resizable nodes (e.g. step_group) */
  width?: number;
  height?: number;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  label?: string;
}

export interface ApplicationFlowGraph {
  nodes: FlowNode[];
  edges: FlowEdge[];
  /** Schema version for forward compatibility */
  version: number;
}

// ─── Flow Settings ──────────────────────────────────────────────────────────

export interface ApplicationFlowConcurrencySettings {
  /** Can a user apply again to this flow while they have an open application? */
  allowReapplyToSameFlow: boolean;
  /** Can a user apply to this flow while they have an open application on another flow? */
  allowCrossFlowApplications: boolean;
}

export interface ApplicationFlowSettings {
  embed: {
    channelId?: string;
    description?: string;
    buttonLabel?: string;
    color?: string;
  };
  roles: {
    /** Discord role IDs assigned when the applicant submits the form */
    onSubmission: string[];
    /** Discord role IDs removed when the applicant submits the form */
    removeOnSubmission: string[];
    /** Discord role IDs assigned when a moderator approves the application */
    onApproval: string[];
    /** Discord role IDs removed when a moderator approves the application */
    removeOnApproval: string[];
  };
  /** Template composing Display Name fields, e.g. "{vorname} | {clan-tag}" */
  displayNameTemplate?: string;
  welcome: {
    channelId?: string;
    /** Supports {discordId} which renders as a Discord mention */
    messageTemplate?: string;
  };
  concurrency: ApplicationFlowConcurrencySettings;
  /** Days after which archived applications are auto-deleted (0 = keep forever) */
  archiveRetentionDays: number;
  /** When enabled, bot skips guild membership and existing member checks */
  testMode: boolean;
  /** Token validity in minutes (default 60) */
  tokenExpiryMinutes: number;
  messages: {
    /** Ephemeral message shown after clicking the embed button */
    ephemeralConfirmation?: string;
    /** Button label in the ephemeral message */
    ephemeralButtonLabel?: string;
    /** Page shown when the token has expired */
    tokenExpired?: string;
    /** DM sent to applicant on approval */
    dmOnApproval?: string;
    /** DM sent to applicant on rejection */
    dmOnRejection?: string;
    /** DM sent to moderators on new application */
    dmToModsOnSubmission?: string;
    /** Confirmation shown after successful submission */
    submissionConfirmation?: string;
  };
  ticket?: {
    enabled: boolean;
    /** "thread" creates a thread in a channel; "channel" creates a new text channel */
    type: "thread" | "channel";
    /** For type "thread": the parent channel ID where the thread is created */
    parentChannelId?: string;
    /** For type "channel": the parent category ID where the channel is created */
    parentCategoryId?: string;
    /** Template for the ticket name, e.g. "{username}-bewerbung" */
    nameTemplate?: string;
    /** Role IDs that get read+write access to the ticket (besides the applicant) */
    accessRoleIds: string[];
    /** Optional initial message posted in the ticket */
    initialMessage?: string;
  };
}

// ─── Linearized Flow (output of linearizeFlowGraph) ─────────────────────────

export type LinearizedStepType = "input" | "input_group" | "info" | "abort";

export interface LinearizedInputField {
  nodeId: string;
  inputType: FlowInputType;
  label: string;
  description?: string;
  placeholder?: string;
  required: boolean;
  options?: Array<{ id: string; label: string }>;
  discordRoleOptions?: Array<{
    roleId: string;
    name: string;
    color: number;
    unicodeEmoji?: string | null;
  }>;
  validation?: FlowInputNodeData["validation"];
}

export interface LinearizedStep {
  type: LinearizedStepType;
  /** For single input: one field. For input_group: multiple fields. */
  fields?: LinearizedInputField[];
  /** For info steps */
  infoData?: FlowInfoNodeData;
  /** For abort steps */
  abortMessage?: string;
  /** The node IDs involved in this step (for answer mapping) */
  nodeIds: string[];
}

export interface LinearizedFlowResult {
  steps: LinearizedStep[];
  /** All role IDs collected from Role Assignment nodes in the traversed path */
  collectedRoleIds: string[];
  /** If the flow hits an abort node, this is the abort message */
  abortMessage?: string;
  /** Whether the flow reached a valid end */
  reachedEnd: boolean;
}

// ─── Status Enums (TypeScript mirrors of pgEnum) ────────────────────────────

export type ApplicationFlowStatus = "draft" | "active" | "inactive";
export type ApplicationStatus = "pending" | "approved" | "rejected";
export type EditorMode = "simple" | "advanced";

// ─── Simple Mode Types ─────────────────────────────────────────────────────

export interface SimpleFormSection {
  id: string;
  title: string;
  items: SimpleFormItem[];
}

export interface SimpleFormItem {
  /** Maps directly to FlowNode.id for stable round-tripping */
  id: string;
  type: "input" | "info" | "role_assignment";
  data: FlowInputNodeData | FlowInfoNodeData | FlowRoleAssignmentNodeData;
}

// ─── Default Flow Graph ─────────────────────────────────────────────────────

export function createDefaultFlowGraph(): ApplicationFlowGraph {
  return {
    nodes: [
      { id: "start", type: "start", position: { x: 250, y: 50 }, data: {} },
      { id: "end", type: "end", position: { x: 250, y: 400 }, data: {} }
    ],
    edges: [{ id: "start-end", source: "start", target: "end" }],
    version: 1
  };
}

interface TemplateLabels {
  section1Title: string;
  characterName: string;
  characterNamePlaceholder: string;
  classRole: string;
  classRoleOptions: string[];
  experience: string;
  experiencePlaceholder: string;
  section2Title: string;
  weeklyHours: string;
  playTimes: string;
  playTimeOptions: string[];
  motivation: string;
  motivationPlaceholder: string;
}

const templateLabels: Record<string, TemplateLabels> = {
  de: {
    section1Title: "Über dich",
    characterName: "Charakter-/Ingame-Name",
    characterNamePlaceholder: "Dein Ingame-Name",
    classRole: "Klasse / Rolle",
    classRoleOptions: ["Tank", "Healer", "DPS", "Support"],
    experience: "Spielerfahrung",
    experiencePlaceholder: "Erzähl uns etwas über deine bisherige Spielerfahrung…",
    section2Title: "Verfügbarkeit",
    weeklyHours: "Wöchentliche Spielzeit (Stunden)",
    playTimes: "Bevorzugte Spielzeiten",
    playTimeOptions: ["Abends (18–22 Uhr)", "Nachts (22–02 Uhr)", "Wochenende"],
    motivation: "Motivation",
    motivationPlaceholder: "Warum möchtest du bei uns mitmachen?"
  },
  en: {
    section1Title: "About You",
    characterName: "Character / Ingame Name",
    characterNamePlaceholder: "Your ingame name",
    classRole: "Class / Role",
    classRoleOptions: ["Tank", "Healer", "DPS", "Support"],
    experience: "Gaming Experience",
    experiencePlaceholder: "Tell us about your gaming experience…",
    section2Title: "Availability",
    weeklyHours: "Weekly Playtime (Hours)",
    playTimes: "Preferred Play Times",
    playTimeOptions: ["Evenings (6–10 PM)", "Nights (10 PM–2 AM)", "Weekends"],
    motivation: "Motivation",
    motivationPlaceholder: "Why do you want to join us?"
  }
};

function getTemplateLabels(locale?: string): TemplateLabels {
  return templateLabels[locale ?? "en"] ?? templateLabels.en;
}

/**
 * Creates a pre-filled gaming guild application template as a full flow graph.
 * Used for new flows in Simple Mode (and as advanced-mode equivalent).
 */
export function createDefaultSimpleFlowGraph(locale?: string): ApplicationFlowGraph {
  const l = getTemplateLabels(locale);

  const section1Id = "group_about";
  const section2Id = "group_availability";

  const field1Id = "field_character_name";
  const field2Id = "field_class_role";
  const field3Id = "field_experience";
  const field4Id = "field_weekly_hours";
  const field5Id = "field_play_times";
  const field6Id = "field_motivation";

  const classOptions = l.classRoleOptions.map((label, i) => ({
    id: `opt_class_${i}`,
    label
  }));

  const timeOptions = l.playTimeOptions.map((label, i) => ({
    id: `opt_time_${i}`,
    label
  }));

  const groupWidth = 400;
  const itemHeight = 100;
  const groupPaddingTop = 60;
  const groupPaddingBottom = 40;

  const section1Height = groupPaddingTop + 3 * itemHeight + groupPaddingBottom;
  const section2Height = groupPaddingTop + 3 * itemHeight + groupPaddingBottom;

  const section1Y = 200;
  const section2Y = section1Y + section1Height + 100;
  const endY = section2Y + section2Height + 100;

  return {
    nodes: [
      { id: "start", type: "start", position: { x: 250, y: 50 }, data: {} },
      // Section 1
      {
        id: section1Id, type: "step_group",
        position: { x: 100, y: section1Y },
        width: groupWidth, height: section1Height,
        data: { title: l.section1Title } as FlowStepGroupNodeData
      },
      {
        id: field1Id, type: "input",
        position: { x: 20, y: groupPaddingTop },
        parentNode: section1Id, extent: "parent",
        data: {
          inputType: "short_text", label: l.characterName,
          placeholder: l.characterNamePlaceholder, required: true
        } as FlowInputNodeData
      },
      {
        id: field2Id, type: "input",
        position: { x: 20, y: groupPaddingTop + itemHeight },
        parentNode: section1Id, extent: "parent",
        data: {
          inputType: "single_select_dropdown", label: l.classRole,
          required: true, options: classOptions
        } as FlowInputNodeData
      },
      {
        id: field3Id, type: "input",
        position: { x: 20, y: groupPaddingTop + 2 * itemHeight },
        parentNode: section1Id, extent: "parent",
        data: {
          inputType: "long_text", label: l.experience,
          placeholder: l.experiencePlaceholder, required: false
        } as FlowInputNodeData
      },
      // Section 2
      {
        id: section2Id, type: "step_group",
        position: { x: 100, y: section2Y },
        width: groupWidth, height: section2Height,
        data: { title: l.section2Title } as FlowStepGroupNodeData
      },
      {
        id: field4Id, type: "input",
        position: { x: 20, y: groupPaddingTop },
        parentNode: section2Id, extent: "parent",
        data: {
          inputType: "number", label: l.weeklyHours, required: false
        } as FlowInputNodeData
      },
      {
        id: field5Id, type: "input",
        position: { x: 20, y: groupPaddingTop + itemHeight },
        parentNode: section2Id, extent: "parent",
        data: {
          inputType: "multi_select", label: l.playTimes,
          required: false, options: timeOptions
        } as FlowInputNodeData
      },
      {
        id: field6Id, type: "input",
        position: { x: 20, y: groupPaddingTop + 2 * itemHeight },
        parentNode: section2Id, extent: "parent",
        data: {
          inputType: "long_text", label: l.motivation,
          placeholder: l.motivationPlaceholder, required: true
        } as FlowInputNodeData
      },
      { id: "end", type: "end", position: { x: 250, y: endY }, data: {} }
    ],
    edges: [
      { id: "e_start_g1", source: "start", target: section1Id },
      { id: "e_g1_g2", source: section1Id, target: section2Id },
      { id: "e_g2_end", source: section2Id, target: "end" }
    ],
    version: 1
  };
}

export function createDefaultFlowSettings(): ApplicationFlowSettings {
  return {
    embed: {},
    roles: { onSubmission: [], removeOnSubmission: [], onApproval: [], removeOnApproval: [] },
    welcome: {},
    concurrency: {
      allowReapplyToSameFlow: false,
      allowCrossFlowApplications: true
    },
    archiveRetentionDays: 0,
    testMode: false,
    tokenExpiryMinutes: 60,
    messages: {},
    ticket: { enabled: false, type: "thread", accessRoleIds: [] }
  };
}
