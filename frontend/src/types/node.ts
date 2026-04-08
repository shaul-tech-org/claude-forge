import type { Node } from '@xyflow/react';

export const FORGE_NODE_TYPES = ['agent', 'skill', 'rule'] as const;
export type ForgeNodeType = (typeof FORGE_NODE_TYPES)[number];

export type AgentModel = 'sonnet' | 'haiku' | 'opus';

export type AgentNodeData = {
  type: 'agent';
  label: string;
  description: string;
  model: AgentModel;
  instructions: string;
  [key: string]: unknown;
};

export type SkillNodeData = {
  type: 'skill';
  label: string;
  description: string;
  trigger: string;
  userInvocable: boolean;
  args: string;
  instructions: string;
  [key: string]: unknown;
};

export type RuleNodeData = {
  type: 'rule';
  label: string;
  description: string;
  category: string;
  paths: string[];
  content: string;
  [key: string]: unknown;
};

export type ForgeNodeData = AgentNodeData | SkillNodeData | RuleNodeData;

export type ForgeNode = Node<ForgeNodeData>;
