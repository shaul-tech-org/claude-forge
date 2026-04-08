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
    `model: ${data.model ?? 'sonnet'}`,
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
  if (data.userInvocable !== false) {
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

  const settings = projectConfig?.settings;
  const hasSettings = settings &&
    (settings.permissions.allow.length > 0 ||
     settings.permissions.deny.length > 0 ||
     settings.permissions.ask.length > 0 ||
     Object.keys(settings.env).length > 0 ||
     settings.model);

  if (hasSettings) {
    const settingsObj: Record<string, unknown> = {};
    const perms: Record<string, string[]> = {};
    if (settings.permissions.allow.length > 0) perms.allow = settings.permissions.allow;
    if (settings.permissions.deny.length > 0) perms.deny = settings.permissions.deny;
    if (settings.permissions.ask.length > 0) perms.ask = settings.permissions.ask;
    if (Object.keys(perms).length > 0) settingsObj.permissions = perms;
    if (Object.keys(settings.env).length > 0) settingsObj.env = settings.env;
    if (settings.model) settingsObj.model = settings.model;
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
    const hooksObj: Partial<Record<string, { command?: string; url?: string }[]>> = {};
    for (const hook of projectConfig.hooks) {
      if (!hooksObj[hook.event]) hooksObj[hook.event] = [];
      const handler: { command?: string; url?: string } = {};
      if (hook.type === 'command' && hook.command) handler.command = hook.command;
      if (hook.type === 'http' && hook.url) handler.url = hook.url;
      if (handler.command || handler.url) hooksObj[hook.event]?.push(handler);
    }
    // hooks go inside settings.json — update it if exists
    const settingsIdx = files.findIndex((f) => f.path === '.claude/settings.json');
    if (settingsIdx >= 0) {
      const existing = JSON.parse(files[settingsIdx].content) as Record<string, unknown>;
      existing.hooks = hooksObj;
      files[settingsIdx].content = JSON.stringify(existing, null, 2) + '\n';
    }
  }

  for (const node of nodes) {
    if (node.data.type === 'agent') {
      const data = node.data;
      const fileName = toKebabCase(data.label) + '.md';
      files.push({
        path: `.claude/agents/${fileName}`,
        content: generateAgentMd(data),
      });
    } else if (node.data.type === 'skill') {
      const data = node.data;
      const dirName = toKebabCase(data.label);
      files.push({
        path: `.claude/skills/${dirName}/${dirName}.md`,
        content: generateSkillMd(data),
      });
    } else {
      const data = node.data;
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

function zipFolder(zip: JSZip, name: string): JSZip {
  const folder = zip.folder(name);
  if (!folder) throw new Error(`Failed to create folder: ${name}`);
  return folder;
}

export async function exportToZip(nodes: ForgeNode[], projectConfig?: ProjectConfig): Promise<Blob> {
  const zip = new JSZip();
  const claude = zipFolder(zip, '.claude');

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
    const agentsDir = zipFolder(claude, 'agents');
    for (const node of agents) {
      const data = node.data as AgentNodeData;
      const fileName = toKebabCase(data.label) + '.md';
      agentsDir.file(fileName, generateAgentMd(data));
    }
  }

  if (skills.length > 0) {
    const skillsDir = zipFolder(claude, 'skills');
    for (const node of skills) {
      const data = node.data as SkillNodeData;
      const dirName = toKebabCase(data.label);
      const skillDir = zipFolder(skillsDir, dirName);
      skillDir.file(dirName + '.md', generateSkillMd(data));
    }
  }

  if (rules.length > 0) {
    const rulesDir = zipFolder(claude, 'rules');
    const byCategory = new Map<string, { data: RuleNodeData }[]>();

    for (const node of rules) {
      const data = node.data as RuleNodeData;
      const category = data.category || 'common';
      if (!byCategory.has(category)) {
        byCategory.set(category, []);
      }
      const items = byCategory.get(category);
      if (items) items.push({ data });
    }

    for (const [cat, items] of byCategory) {
      const catDir = zipFolder(rulesDir, cat);
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
