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

  const agents = nodes.filter((n) => n.data.type === 'agent');
  const skills = nodes.filter((n) => n.data.type === 'skill');
  const rules = nodes.filter((n) => n.data.type === 'rule');

  if (agents.length > 0) {
    const agentsDir: TreeEntry = { name: 'agents', isDir: true, children: [] };
    for (const node of agents) {
      const data = node.data as AgentNodeData;
      const fileName = toKebabCase(data.label) + '.md';
      agentsDir.children!.push({ name: fileName, isDir: false });
    }
    agentsDir.children!.sort((a, b) => a.name.localeCompare(b.name));
    root.children!.push(agentsDir);
  }

  if (skills.length > 0) {
    const skillsDir: TreeEntry = { name: 'skills', isDir: true, children: [] };
    for (const node of skills) {
      const data = node.data as SkillNodeData;
      const dirName = toKebabCase(data.label);
      const skillDir: TreeEntry = {
        name: dirName,
        isDir: true,
        children: [{ name: dirName + '.md', isDir: false }],
      };
      skillsDir.children!.push(skillDir);
    }
    skillsDir.children!.sort((a, b) => a.name.localeCompare(b.name));
    root.children!.push(skillsDir);
  }

  if (rules.length > 0) {
    const rulesDir: TreeEntry = { name: 'rules', isDir: true, children: [] };
    const byCategory = new Map<string, TreeEntry[]>();

    for (const node of rules) {
      const data = node.data as RuleNodeData;
      const category = data.category || 'common';
      if (!byCategory.has(category)) {
        byCategory.set(category, []);
      }
      const fileName = toKebabCase(data.label) + '.md';
      byCategory.get(category)!.push({ name: fileName, isDir: false });
    }

    const sortedCategories = [...byCategory.keys()].sort();
    for (const cat of sortedCategories) {
      const files = byCategory.get(cat)!;
      files.sort((a, b) => a.name.localeCompare(b.name));
      rulesDir.children!.push({ name: cat, isDir: true, children: files });
    }
    root.children!.push(rulesDir);
  }

  return root;
}
