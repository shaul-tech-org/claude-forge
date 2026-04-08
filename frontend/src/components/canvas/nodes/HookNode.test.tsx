import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReactFlowProvider } from '@xyflow/react';
import { HookNode } from './HookNode';

function renderHookNode(data: Record<string, unknown>) {
  const props = {
    id: 'hook-1',
    type: 'hook' as const,
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
      <HookNode {...(props as never)} />
    </ReactFlowProvider>,
  );
}

describe('HookNode', () => {
  it('renders hook node with label', () => {
    renderHookNode({ label: 'PreToolUse Hook', description: 'Runs before tool use' });

    expect(screen.getByText('PreToolUse Hook')).toBeInTheDocument();
    expect(screen.getByText('Runs before tool use')).toBeInTheDocument();
    expect(screen.getByText('Hook')).toBeInTheDocument();
  });

  it('renders event badge when event is provided', () => {
    renderHookNode({ label: 'My Hook', event: 'PreToolUse' });

    expect(screen.getByText('PreToolUse')).toBeInTheDocument();
  });
});
