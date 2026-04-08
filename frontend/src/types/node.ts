import type { Node } from '@xyflow/react';

export const FORGE_NODE_TYPES = ['agent', 'skill', 'rule', 'hook', 'mcp', 'memory', 'permission', 'settings'] as const;
export type ForgeNodeType = (typeof FORGE_NODE_TYPES)[number];

export type AgentModel = 'sonnet' | 'haiku' | 'opus';

export type AgentNodeData = {
  type: 'agent';
  label: string;
  description: string;
  model: AgentModel | undefined;
  instructions: string | undefined;
  [key: string]: unknown;
};

export type SkillNodeData = {
  type: 'skill';
  label: string;
  description: string;
  trigger: string;
  userInvocable: boolean | undefined;
  args: string | undefined;
  instructions: string | undefined;
  [key: string]: unknown;
};

export type RuleNodeData = {
  type: 'rule';
  label: string;
  description: string;
  category: string;
  paths: string[] | undefined;
  content: string | undefined;
  [key: string]: unknown;
};

export type HookNodeData = {
  type: 'hook';
  label: string;
  description: string;
  event: string;
  command: string | undefined;
  [key: string]: unknown;
};

export type McpNodeData = {
  type: 'mcp';
  label: string;
  description: string;
  serverUrl: string | undefined;
  tools: string[] | undefined;
  [key: string]: unknown;
};

export type MemoryNodeData = {
  type: 'memory';
  label: string;
  description: string;
  memoryType: string;
  [key: string]: unknown;
};

export type PermissionNodeData = {
  type: 'permission';
  label: string;
  description: string;
  mode: string;
  allowedTools: string[] | undefined;
  [key: string]: unknown;
};

export type SettingsNodeData = {
  type: 'settings';
  label: string;
  description: string;
  key: string | undefined;
  value: string | undefined;
  [key: string]: unknown;
};

export type ForgeNodeData = AgentNodeData | SkillNodeData | RuleNodeData | HookNodeData | McpNodeData | MemoryNodeData | PermissionNodeData | SettingsNodeData;

export type ForgeNode = Node<ForgeNodeData>;
