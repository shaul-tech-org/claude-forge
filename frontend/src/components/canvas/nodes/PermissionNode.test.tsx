import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReactFlowProvider } from '@xyflow/react';
import { PermissionNode } from './PermissionNode';

function renderPermissionNode(data: Record<string, unknown>) {
  const props = {
    id: 'perm-1',
    type: 'permission' as const,
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
      <PermissionNode {...(props as never)} />
    </ReactFlowProvider>,
  );
}

describe('PermissionNode', () => {
  it('renders permission node with label', () => {
    renderPermissionNode({ label: 'File Access', description: 'Controls file operations' });

    expect(screen.getByText('File Access')).toBeInTheDocument();
    expect(screen.getByText('Controls file operations')).toBeInTheDocument();
    expect(screen.getByText('Permission')).toBeInTheDocument();
  });

  it('renders mode badge', () => {
    renderPermissionNode({ label: 'Shell Access', mode: 'allowlist' });

    expect(screen.getByText('allowlist')).toBeInTheDocument();
  });
});
