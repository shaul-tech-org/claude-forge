import { useState, useCallback } from 'react';
import { useCanvasContext } from '../../contexts/CanvasContext';
import type { McpServer } from '../../types/project';

interface McpEditorProps {
  onClose: () => void;
}

export function McpEditor({ onClose }: McpEditorProps) {
  const { projectConfig, setMcpServers } = useCanvasContext();
  const [servers, setServers] = useState<McpServer[]>(projectConfig.mcpServers);

  const addServer = useCallback(() => {
    setServers((prev) => [
      ...prev,
      { name: '', command: '', args: [], env: {} },
    ]);
  }, []);

  const updateServer = useCallback((index: number, field: keyof McpServer, value: unknown) => {
    setServers((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
    );
  }, []);

  const removeServer = useCallback((index: number) => {
    setServers((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSave = () => {
    setMcpServers(servers.filter((s) => s.name.trim()));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="mx-4 flex h-[80vh] w-full max-w-2xl flex-col rounded-lg bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <div>
            <h2 className="text-sm font-bold text-gray-900">.mcp.json</h2>
            <p className="text-xs text-gray-500">MCP 서버 설정 — 프로젝트 스코프 도구 연결</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleSave} className="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800">Save</button>
            <button onClick={onClose} className="rounded p-1 text-gray-400 hover:bg-gray-100">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {servers.map((server, i) => (
            <div key={i} className="mb-4 rounded-lg border border-gray-200 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500">Server {i + 1}</span>
                <button onClick={() => removeServer(i)} className="text-xs text-gray-400 hover:text-red-500">삭제</button>
              </div>
              <div className="flex flex-col gap-2">
                <input
                  placeholder="서버 이름 (예: github, filesystem)"
                  value={server.name}
                  onChange={(e) => updateServer(i, 'name', e.target.value)}
                  className="rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <input
                  placeholder="command (예: npx, node, python)"
                  value={server.command}
                  onChange={(e) => updateServer(i, 'command', e.target.value)}
                  className="rounded-md border border-gray-300 px-2.5 py-1.5 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <input
                  placeholder="args (쉼표 구분, 예: -y, @modelcontextprotocol/server-github)"
                  value={server.args.join(', ')}
                  onChange={(e) => updateServer(i, 'args', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
                  className="rounded-md border border-gray-300 px-2.5 py-1.5 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <input
                  placeholder="env (KEY=VALUE, 쉼표 구분)"
                  value={Object.entries(server.env).map(([k, v]) => `${k}=${v}`).join(', ')}
                  onChange={(e) => {
                    const env: Record<string, string> = {};
                    e.target.value.split(',').forEach((pair) => {
                      const [k, ...rest] = pair.split('=');
                      if (k?.trim()) env[k.trim()] = rest.join('=').trim();
                    });
                    updateServer(i, 'env', env);
                  }}
                  className="rounded-md border border-gray-300 px-2.5 py-1.5 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          ))}

          <button
            onClick={addServer}
            className="w-full rounded-lg border-2 border-dashed border-gray-300 py-2.5 text-sm text-gray-500 hover:border-gray-400 hover:text-gray-700"
          >
            + MCP Server 추가
          </button>
        </div>
      </div>
    </div>
  );
}
