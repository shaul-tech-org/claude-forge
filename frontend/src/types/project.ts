export interface PermissionRule {
  pattern: string;
  mode: 'allow' | 'deny' | 'ask';
}

export interface McpServer {
  name: string;
  command: string;
  args: string[];
  env: Record<string, string>;
}

export type HookEvent =
  | 'PreToolUse' | 'PostToolUse' | 'Stop' | 'SessionStart' | 'SessionEnd'
  | 'UserPromptSubmit' | 'Notification' | 'SubagentStart' | 'SubagentStop';

export interface HookHandler {
  event: HookEvent;
  type: 'command' | 'http';
  command?: string;
  url?: string;
}

export interface ProjectSettings {
  permissions: {
    allow: string[];
    deny: string[];
    ask: string[];
  };
  env: Record<string, string>;
  model: string;
  hooks: Record<string, unknown>;
  [key: string]: unknown;
}

export interface ProjectConfig {
  claudeMd: string;
  settings: ProjectSettings;
  mcpServers: McpServer[];
  hooks: HookHandler[];
}

export const DEFAULT_PROJECT_CONFIG: ProjectConfig = {
  claudeMd: '',
  settings: {
    permissions: { allow: [], deny: [], ask: [] },
    env: {},
    model: '',
    hooks: {},
  },
  mcpServers: [],
  hooks: [],
};
