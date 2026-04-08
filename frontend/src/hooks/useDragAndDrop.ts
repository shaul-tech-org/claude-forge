import { useCallback, type DragEvent } from 'react';
import { useReactFlow } from '@xyflow/react';
import type { ForgeNodeType, ForgeNode } from '../types/node';
import type { ForgeEdge } from '../types/edge';

const DRAG_DATA_KEY = 'application/reactflow';

export function setDragData(event: DragEvent, nodeType: ForgeNodeType): void {
  event.dataTransfer.setData(DRAG_DATA_KEY, nodeType);
  event.dataTransfer.effectAllowed = 'move';
}

export function useDragAndDrop(addNode: (nodeType: ForgeNodeType, position: { x: number; y: number }) => void) {
  const reactFlow = useReactFlow<ForgeNode, ForgeEdge>();

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      const raw = event.dataTransfer.getData(DRAG_DATA_KEY);
      if (!raw) return;
      const nodeType = raw as ForgeNodeType;

      const position = reactFlow.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      addNode(nodeType, position);
    },
    [reactFlow, addNode],
  );

  return { onDragOver, onDrop };
}
