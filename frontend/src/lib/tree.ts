import type { ForgeNode } from '../types/node';
import type { AgentNodeData, SkillNodeData, RuleNodeData } from '../types/node';

function toKebabCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'untitled';
}

export interface TreeEntry {
  name: string;
  isDir: boolean;
  children?: TreeEntry[];
}

export function buildClaudeTree(nodes: ForgeNode[]): TreeEntry {
  const root: TreeEntry = { name: '.claude', isDir: true, children: [] };
  const rootChildren = root.children ?? [];

  const agents = nodes.filter((n) => n.data.type === 'agent');
  const skills = nodes.filter((n) => n.data.type === 'skill');
  const rules = nodes.filter((n) => n.data.type === 'rule');

  if (agents.length > 0) {
    const agentFiles: TreeEntry[] = [];
    for (const node of agents) {
      const data = node.data as AgentNodeData;
      const fileName = toKebabCase(data.label) + '.md';
      agentFiles.push({ name: fileName, isDir: false });
    }
    agentFiles.sort((a, b) => a.name.localeCompare(b.name));
    rootChildren.push({ name: 'agents', isDir: true, children: agentFiles });
  }

  if (skills.length > 0) {
    const skillEntries: TreeEntry[] = [];
    for (const node of skills) {
      const data = node.data as SkillNodeData;
      const dirName = toKebabCase(data.label);
      const skillDir: TreeEntry = {
        name: dirName,
        isDir: true,
        children: [{ name: dirName + '.md', isDir: false }],
      };
      skillEntries.push(skillDir);
    }
    skillEntries.sort((a, b) => a.name.localeCompare(b.name));
    rootChildren.push({ name: 'skills', isDir: true, children: skillEntries });
  }

  if (rules.length > 0) {
    const byCategory = new Map<string, TreeEntry[]>();

    for (const node of rules) {
      const data = node.data as RuleNodeData;
      const category = data.category || 'common';
      if (!byCategory.has(category)) {
        byCategory.set(category, []);
      }
      const fileName = toKebabCase(data.label) + '.md';
      const items = byCategory.get(category);
      if (items) items.push({ name: fileName, isDir: false });
    }

    const ruleEntries: TreeEntry[] = [];
    const sortedCategories = [...byCategory.keys()].sort();
    for (const cat of sortedCategories) {
      const files = byCategory.get(cat);
      if (files) {
        files.sort((a, b) => a.name.localeCompare(b.name));
        ruleEntries.push({ name: cat, isDir: true, children: files });
      }
    }
    rootChildren.push({ name: 'rules', isDir: true, children: ruleEntries });
  }

  return root;
}
