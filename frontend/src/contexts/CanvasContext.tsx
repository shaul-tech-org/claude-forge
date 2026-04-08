import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { OnNodesChange, OnEdgesChange, Connection, XYPosition } from '@xyflow/react';
import { useCanvas } from '../hooks/useCanvas';
import { useCanvasPersistence, loadCanvasState } from '../hooks/useCanvasPersistence';
import type { ForgeNode, ForgeNodeType, ForgeNodeData } from '../types/node';
import type { ForgeEdge } from '../types/edge';

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
}

const CanvasContext = createContext<CanvasContextValue | null>(null);

const savedState = loadCanvasState();

export function CanvasProvider({ children }: { children: ReactNode }) {
  const canvas = useCanvas(savedState?.nodes ?? [], savedState?.edges ?? []);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  useCanvasPersistence(canvas.nodes, canvas.edges);

  const selectNode = useCallback((id: string | null) => {
    setSelectedNodeId(id);
  }, []);

  const selectedNode = selectedNodeId
    ? canvas.nodes.find((n) => n.id === selectedNodeId)
    : undefined;

  return (
    <CanvasContext.Provider
      value={{
        ...canvas,
        selectedNodeId,
        selectNode,
        selectedNode,
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
