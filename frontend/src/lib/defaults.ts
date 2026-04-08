import type { AgentNodeData, SkillNodeData, RuleNodeData, ForgeNodeData, ForgeNodeType } from '../types/node';

export function createAgentNodeData(overrides?: Partial<AgentNodeData>): AgentNodeData {
  return {
    type: 'agent',
    label: 'New Agent',
    description: '',
    model: 'sonnet',
    instructions: '',
    ...overrides,
  };
}

export function createSkillNodeData(overrides?: Partial<SkillNodeData>): SkillNodeData {
  return {
    type: 'skill',
    label: 'New Skill',
    description: '',
    trigger: '',
    userInvocable: true,
    args: '',
    instructions: '',
    ...overrides,
  };
}

export function createRuleNodeData(overrides?: Partial<RuleNodeData>): RuleNodeData {
  return {
    type: 'rule',
    label: 'New Rule',
    description: '',
    category: '',
    paths: [],
    content: '',
    ...overrides,
  };
}

export function createNodeData(nodeType: ForgeNodeType): ForgeNodeData {
  switch (nodeType) {
    case 'agent':
      return createAgentNodeData();
    case 'skill':
      return createSkillNodeData();
    case 'rule':
      return createRuleNodeData();
  }
}
