import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { OnNodesChange, OnEdgesChange, Connection, XYPosition } from '@xyflow/react';
import { useCanvas } from '../hooks/useCanvas';
import { useCanvasPersistence, loadCanvasState } from '../hooks/useCanvasPersistence';
import type { ForgeNode, ForgeNodeType, ForgeNodeData } from '../types/node';
import type { ForgeEdge } from '../types/edge';
import { DEFAULT_PROJECT_CONFIG, type ProjectConfig, type ProjectSettings, type McpServer, type HookHandler } from '../types/project';

interface CanvasContextValue {
  nodes: ForgeNode[];
  edges: ForgeEdge[];
  onNodesChange: OnNodesChange<ForgeNode>;
  onEdgesChange: OnEdgesChange<ForgeEdge>;
  addNode: (nodeType: ForgeNodeType, position: XYPosition) => void;
  deleteNode: (id: string) => void;
  onConnect: (connection: Connection) => void;
  deleteEdge: (id: string) => void;
  updateNodeData: (id: string, data: Partial<ForgeNodeData>) => void;
  setNodes: React.Dispatch<React.SetStateAction<ForgeNode[]>>;
  setEdges: React.Dispatch<React.SetStateAction<ForgeEdge[]>>;
  selectedNodeId: string | null;
  selectNode: (id: string | null) => void;
  selectedNode: ForgeNode | undefined;
  projectConfig: ProjectConfig;
  setClaudeMd: (md: string) => void;
  setProjectSettings: (settings: ProjectSettings) => void;
  setMcpServers: (servers: McpServer[]) => void;
  setHooks: (hooks: HookHandler[]) => void;
}

const CanvasContext = createContext<CanvasContextValue | null>(null);

const savedState = loadCanvasState();

function loadProjectConfig(): ProjectConfig {
  try {
    const raw = localStorage.getItem('claude-forge-project-config');
    if (raw) return JSON.parse(raw) as ProjectConfig;
  } catch { /* ignore */ }
  return DEFAULT_PROJECT_CONFIG;
}

function saveProjectConfig(config: ProjectConfig): void {
  localStorage.setItem('claude-forge-project-config', JSON.stringify(config));
}

export function CanvasProvider({ children }: { children: ReactNode }) {
  const canvas = useCanvas(savedState?.nodes ?? [], savedState?.edges ?? []);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [projectConfig, setProjectConfig] = useState<ProjectConfig>(loadProjectConfig);

  useCanvasPersistence(canvas.nodes, canvas.edges);

  const selectNode = useCallback((id: string | null) => {
    setSelectedNodeId(id);
  }, []);

  const selectedNode = selectedNodeId
    ? canvas.nodes.find((n) => n.id === selectedNodeId)
    : undefined;

  const setClaudeMd = useCallback((md: string) => {
    setProjectConfig((prev) => {
      const next = { ...prev, claudeMd: md };
      saveProjectConfig(next);
      return next;
    });
  }, []);

  const setProjectSettings = useCallback((settings: ProjectSettings) => {
    setProjectConfig((prev) => {
      const next = { ...prev, settings };
      saveProjectConfig(next);
      return next;
    });
  }, []);

  const setMcpServers = useCallback((mcpServers: McpServer[]) => {
    setProjectConfig((prev) => {
      const next = { ...prev, mcpServers };
      saveProjectConfig(next);
      return next;
    });
  }, []);

  const setHooks = useCallback((hooks: HookHandler[]) => {
    setProjectConfig((prev) => {
      const next = { ...prev, hooks };
      saveProjectConfig(next);
      return next;
    });
  }, []);

  return (
    <CanvasContext.Provider
      value={{
        ...canvas,
        selectedNodeId,
        selectNode,
        selectedNode,
        projectConfig,
        setClaudeMd,
        setProjectSettings,
        setMcpServers,
        setHooks,
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
}

export function useCanvasContext(): CanvasContextValue {
  const ctx = useContext(CanvasContext);
  if (!ctx) {
    throw new Error('useCanvasContext must be used within CanvasProvider');
  }
  return ctx;
}
