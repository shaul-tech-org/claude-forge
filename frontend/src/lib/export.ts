import JSZip from 'jszip';
import type { ForgeNode } from '../types/node';
import type { AgentNodeData, SkillNodeData, RuleNodeData } from '../types/node';
import type { ProjectConfig } from '../types/project';

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

export function buildFileList(nodes: ForgeNode[], projectConfig?: ProjectConfig): FileEntry[] {
  const files: FileEntry[] = [];

  if (projectConfig?.claudeMd) {
    files.push({ path: '.claude/CLAUDE.md', content: projectConfig.claudeMd });
  }

  const hasSettings = projectConfig?.settings &&
    (projectConfig.settings.permissions.allow.length > 0 ||
     projectConfig.settings.permissions.deny.length > 0 ||
     projectConfig.settings.permissions.ask.length > 0 ||
     Object.keys(projectConfig.settings.env).length > 0 ||
     projectConfig.settings.model);

  if (hasSettings && projectConfig?.settings) {
    const settingsObj: Record<string, unknown> = {};
    const perms: Record<string, string[]> = {};
    if (projectConfig.settings.permissions.allow.length > 0) perms.allow = projectConfig.settings.permissions.allow;
    if (projectConfig.settings.permissions.deny.length > 0) perms.deny = projectConfig.settings.permissions.deny;
    if (projectConfig.settings.permissions.ask.length > 0) perms.ask = projectConfig.settings.permissions.ask;
    if (Object.keys(perms).length > 0) settingsObj.permissions = perms;
    if (Object.keys(projectConfig.settings.env).length > 0) settingsObj.env = projectConfig.settings.env;
    if (projectConfig.settings.model) settingsObj.model = projectConfig.settings.model;
    files.push({ path: '.claude/settings.json', content: JSON.stringify(settingsObj, null, 2) + '\n' });
  }

  if (projectConfig?.mcpServers && projectConfig.mcpServers.length > 0) {
    const mcpObj: Record<string, { command: string; args: string[]; env?: Record<string, string> }> = {};
    for (const server of projectConfig.mcpServers) {
      if (!server.name) continue;
      mcpObj[server.name] = { command: server.command, args: server.args };
      if (Object.keys(server.env).length > 0) {
        mcpObj[server.name].env = server.env;
      }
    }
    if (Object.keys(mcpObj).length > 0) {
      files.push({ path: '.mcp.json', content: JSON.stringify({ mcpServers: mcpObj }, null, 2) + '\n' });
    }
  }

  if (projectConfig?.hooks && projectConfig.hooks.length > 0) {
    const hooksObj: Record<string, { command?: string; url?: string }[]> = {};
    for (const hook of projectConfig.hooks) {
      if (!hooksObj[hook.event]) hooksObj[hook.event] = [];
      const handler: { command?: string; url?: string } = {};
      if (hook.type === 'command' && hook.command) handler.command = hook.command;
      if (hook.type === 'http' && hook.url) handler.url = hook.url;
      if (handler.command || handler.url) hooksObj[hook.event].push(handler);
    }
    // hooks go inside settings.json — update it if exists
    const settingsIdx = files.findIndex((f) => f.path === '.claude/settings.json');
    if (settingsIdx >= 0) {
      const existing = JSON.parse(files[settingsIdx].content);
      existing.hooks = hooksObj;
      files[settingsIdx].content = JSON.stringify(existing, null, 2) + '\n';
    }
  }

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

export async function exportToZip(nodes: ForgeNode[], projectConfig?: ProjectConfig): Promise<Blob> {
  const zip = new JSZip();
  const claude = zip.folder('.claude')!;

  if (projectConfig?.claudeMd) {
    claude.file('CLAUDE.md', projectConfig.claudeMd);
  }

  const fileList = buildFileList(nodes, projectConfig);
  const settingsFile = fileList.find((f) => f.path === '.claude/settings.json');
  if (settingsFile) {
    claude.file('settings.json', settingsFile.content);
  }

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
