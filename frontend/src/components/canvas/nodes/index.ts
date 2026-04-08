import type { NodeTypes } from '@xyflow/react';
import { AgentNode } from './AgentNode';
import { SkillNode } from './SkillNode';
import { RuleNode } from './RuleNode';
import { HookNode } from './HookNode';
import { McpServerNode } from './McpServerNode';
import { MemoryNode } from './MemoryNode';
import { PermissionNode } from './PermissionNode';
import { SettingsNode } from './SettingsNode';

export const nodeTypes: NodeTypes = {
  agent: AgentNode,
  skill: SkillNode,
  rule: RuleNode,
  hook: HookNode,
  mcp: McpServerNode,
  memory: MemoryNode,
  permission: PermissionNode,
  settings: SettingsNode,
};
