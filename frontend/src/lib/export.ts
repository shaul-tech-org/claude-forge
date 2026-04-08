import JSZip from 'jszip';
import type { ForgeNode } from '../types/node';
import type { AgentNodeData, SkillNodeData, RuleNodeData } from '../types/node';

export function toKebabCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'untitled';
}

export function generateAgentMd(data: AgentNodeData): string {
  const lines: string[] = [
    '---',
    `name: ${data.label}`,
    `description: "${data.description}"`,
    `model: ${data.model}`,
    '---',
  ];
  if (data.instructions) {
    lines.push('', data.instructions);
  }
  return lines.join('\n') + '\n';
}

export function generateSkillMd(data: SkillNodeData): string {
  const lines: string[] = [
    '---',
    `name: ${data.label}`,
    `description: "${data.description}"`,
  ];
  const userInvocable = data.userInvocable ?? true;
  if (userInvocable) {
    lines.push(`user_invocable: true`);
  }
  if (data.args) {
    lines.push(`args: "${data.args}"`);
  }
  lines.push('---');
  if (data.instructions) {
    lines.push('', data.instructions);
  }
  return lines.join('\n') + '\n';
}

export function generateRuleMd(data: RuleNodeData): string {
  const lines: string[] = ['---'];
  if (data.paths && data.paths.length > 0) {
    lines.push('paths:');
    for (const p of data.paths) {
      lines.push(`  - "${p}"`);
    }
  }
  lines.push('---');
  if (data.content) {
    lines.push('', data.content);
  }
  return lines.join('\n') + '\n';
}

export interface FileEntry {
  path: string;
  content: string;
}

export function buildFileList(nodes: ForgeNode[]): FileEntry[] {
  const files: FileEntry[] = [];

  for (const node of nodes) {
    if (node.data.type === 'agent') {
      const data = node.data as AgentNodeData;
      const fileName = toKebabCase(data.label) + '.md';
      files.push({
        path: `.claude/agents/${fileName}`,
        content: generateAgentMd(data),
      });
    } else if (node.data.type === 'skill') {
      const data = node.data as SkillNodeData;
      const dirName = toKebabCase(data.label);
      files.push({
        path: `.claude/skills/${dirName}/${dirName}.md`,
        content: generateSkillMd(data),
      });
    } else if (node.data.type === 'rule') {
      const data = node.data as RuleNodeData;
      const category = data.category || 'common';
      const fileName = toKebabCase(data.label) + '.md';
      files.push({
        path: `.claude/rules/${category}/${fileName}`,
        content: generateRuleMd(data),
      });
    }
  }

  return files.sort((a, b) => a.path.localeCompare(b.path));
}

export async function exportToZip(nodes: ForgeNode[]): Promise<Blob> {
  const zip = new JSZip();
  const claude = zip.folder('.claude')!;

  const agents = nodes.filter((n) => n.data.type === 'agent');
  const skills = nodes.filter((n) => n.data.type === 'skill');
  const rules = nodes.filter((n) => n.data.type === 'rule');

  if (agents.length > 0) {
    const agentsDir = claude.folder('agents')!;
    for (const node of agents) {
      const data = node.data as AgentNodeData;
      const fileName = toKebabCase(data.label) + '.md';
      agentsDir.file(fileName, generateAgentMd(data));
    }
  }

  if (skills.length > 0) {
    const skillsDir = claude.folder('skills')!;
    for (const node of skills) {
      const data = node.data as SkillNodeData;
      const dirName = toKebabCase(data.label);
      const skillDir = skillsDir.folder(dirName)!;
      skillDir.file(dirName + '.md', generateSkillMd(data));
    }
  }

  if (rules.length > 0) {
    const rulesDir = claude.folder('rules')!;
    const byCategory = new Map<string, { data: RuleNodeData }[]>();

    for (const node of rules) {
      const data = node.data as RuleNodeData;
      const category = data.category || 'common';
      if (!byCategory.has(category)) {
        byCategory.set(category, []);
      }
      byCategory.get(category)!.push({ data });
    }

    for (const [cat, items] of byCategory) {
      const catDir = rulesDir.folder(cat)!;
      for (const item of items) {
        const fileName = toKebabCase(item.data.label) + '.md';
        catDir.file(fileName, generateRuleMd(item.data));
      }
    }
  }

  return zip.generateAsync({ type: 'blob' });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
