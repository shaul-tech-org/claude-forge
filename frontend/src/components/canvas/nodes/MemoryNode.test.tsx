import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReactFlowProvider } from '@xyflow/react';
import { MemoryNode } from './MemoryNode';

function renderMemoryNode(data: Record<string, unknown>) {
  const props = {
    id: 'mem-1',
    type: 'memory' as const,
    data,
    selected: false,
    isConnectable: true,
    zIndex: 0,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
    dragging: false,
    deletable: true,
    selectable: true,
    parentId: undefined,
    sourcePosition: undefined,
    targetPosition: undefined,
    dragHandle: undefined,
    width: 200,
    height: 80,
  };

  return render(
    <ReactFlowProvider>
      <MemoryNode {...(props as never)} />
    </ReactFlowProvider>,
  );
}

describe('MemoryNode', () => {
  it('renders memory node with label', () => {
    renderMemoryNode({ label: 'Project Memory', description: 'Stores project state' });

    expect(screen.getByText('Project Memory')).toBeInTheDocument();
    expect(screen.getByText('Stores project state')).toBeInTheDocument();
    expect(screen.getByText('Memory')).toBeInTheDocument();
  });

  it('renders memory type badge', () => {
    renderMemoryNode({ label: 'Auto Memory', memoryType: 'auto' });

    expect(screen.getByText('auto')).toBeInTheDocument();
  });
});
