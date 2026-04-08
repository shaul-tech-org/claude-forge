import type { NodeTypes } from '@xyflow/react';
import { AgentNode } from './AgentNode';
import { SkillNode } from './SkillNode';
import { RuleNode } from './RuleNode';

export const nodeTypes: NodeTypes = {
  agent: AgentNode,
  skill: SkillNode,
  rule: RuleNode,
};
