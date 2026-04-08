import { useCallback } from 'react';
import {
  useNodesState,
  useEdgesState,
  type Connection,
  type OnNodesChange,
  type OnEdgesChange,
  addEdge as rfAddEdge,
  type XYPosition,
} from '@xyflow/react';
import type { ForgeNode, ForgeNodeData } from '../types/node';
import type { ForgeEdge } from '../types/edge';
import type { ForgeEdgeType } from '../types/edge';
import type { ForgeNodeType } from '../types/node';
import { generateId } from '../lib/id';
import { createNodeData } from '../lib/defaults';

interface UseCanvasReturn {
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
}

export function useCanvas(
  initialNodes: ForgeNode[] = [],
  initialEdges: ForgeEdge[] = [],
): UseCanvasReturn {
  const [nodes, setNodes, onNodesChange] = useNodesState<ForgeNode>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<ForgeEdge>(initialEdges);

  const addNode = useCallback(
    (nodeType: ForgeNodeType, position: XYPosition) => {
      const newNode: ForgeNode = {
        id: generateId(),
        type: nodeType,
        position,
        data: createNodeData(nodeType),
      };
      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes],
  );

  const deleteNode = useCallback(
    (id: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== id));
      setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
    },
    [setNodes, setEdges],
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      const sourceNode = nodes.find((n) => n.id === connection.source);
      const targetNode = nodes.find((n) => n.id === connection.target);
      if (!sourceNode || !targetNode) return;

      // Only Agent can be a source
      if (sourceNode.type !== 'agent') return;

      let relationship: ForgeEdgeType;
      if (targetNode.type === 'agent') {
        relationship = 'delegation';
      } else if (targetNode.type === 'skill') {
        relationship = 'uses';
      } else if (targetNode.type === 'rule') {
        relationship = 'applies';
      } else {
        return;
      }

      const newEdge: ForgeEdge = {
        ...connection,
        id: generateId(),
        type: relationship,
        data: { relationship },
      };
      setEdges((eds) => rfAddEdge(newEdge, eds));
    },
    [setEdges, nodes],
  );

  const updateNodeData = useCallback(
    (id: string, partialData: Partial<ForgeNodeData>) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === id
            ? { ...n, data: { ...n.data, ...partialData } as ForgeNodeData }
            : n,
        ),
      );
    },
    [setNodes],
  );

  const deleteEdge = useCallback(
    (id: string) => {
      setEdges((eds) => eds.filter((e) => e.id !== id));
    },
    [setEdges],
  );

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    addNode,
    deleteNode,
    onConnect,
    deleteEdge,
    updateNodeData,
    setNodes,
    setEdges,
  };
}
