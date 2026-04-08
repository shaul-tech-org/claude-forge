import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReactFlowProvider } from '@xyflow/react';
import { McpServerNode } from './McpServerNode';

function renderMcpNode(data: Record<string, unknown>) {
  const props = {
    id: 'mcp-1',
    type: 'mcp' as const,
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
      <McpServerNode {...(props as never)} />
    </ReactFlowProvider>,
  );
}

describe('McpServerNode', () => {
  it('renders MCP server node with label', () => {
    renderMcpNode({ label: 'GitHub MCP', description: 'GitHub integration' });

    expect(screen.getByText('GitHub MCP')).toBeInTheDocument();
    expect(screen.getByText('GitHub integration')).toBeInTheDocument();
    expect(screen.getByText('MCP Server')).toBeInTheDocument();
  });

  it('renders tools badges when tools provided', () => {
    renderMcpNode({ label: 'DB Server', tools: ['query', 'insert', 'delete'] });

    expect(screen.getByText('query')).toBeInTheDocument();
    expect(screen.getByText('insert')).toBeInTheDocument();
    expect(screen.getByText('delete')).toBeInTheDocument();
  });
});
