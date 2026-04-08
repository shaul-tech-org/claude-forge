import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReactFlowProvider } from '@xyflow/react';
import { SettingsNode } from './SettingsNode';

function renderSettingsNode(data: Record<string, unknown>) {
  const props = {
    id: 'set-1',
    type: 'settings' as const,
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
      <SettingsNode {...(props as never)} />
    </ReactFlowProvider>,
  );
}

describe('SettingsNode', () => {
  it('renders settings node with label', () => {
    renderSettingsNode({ label: 'Auto Compact', description: 'Compact mode setting' });

    expect(screen.getByText('Auto Compact')).toBeInTheDocument();
    expect(screen.getByText('Compact mode setting')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('renders key-value pair when provided', () => {
    renderSettingsNode({ label: 'Theme', key: 'theme', value: 'dark' });

    expect(screen.getByText('theme: dark')).toBeInTheDocument();
  });
});
