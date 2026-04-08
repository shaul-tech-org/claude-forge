import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ReactFlowProvider, Position } from '@xyflow/react';
import { LoadEdge } from './LoadEdge';

describe('LoadEdge', () => {
  it('renders load edge with thick stroke', () => {
    const props = {
      id: 'edge-load-1',
      source: 'a',
      target: 'b',
      sourceX: 0,
      sourceY: 0,
      targetX: 100,
      targetY: 100,
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
      markerEnd: undefined,
      data: {},
      selected: false,
      animated: false,
      interactionWidth: 20,
      sourceHandleId: null,
      targetHandleId: null,
      pathOptions: undefined,
      style: {},
      label: undefined,
      labelStyle: undefined,
      labelShowBg: undefined,
      labelBgStyle: undefined,
      labelBgPadding: undefined,
      labelBgBorderRadius: undefined,
      deletable: true,
      selectable: true,
      markerStart: undefined,
    };

    const { container } = render(
      <ReactFlowProvider>
        <svg>
          <LoadEdge {...(props as never)} />
        </svg>
      </ReactFlowProvider>,
    );

    const path = container.querySelector('path');
    expect(path).not.toBeNull();
  });
});
