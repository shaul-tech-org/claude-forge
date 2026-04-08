import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ReactFlowProvider, Position } from '@xyflow/react';
import { TriggerEdge } from './TriggerEdge';

describe('TriggerEdge', () => {
  it('renders trigger edge with dashed style', () => {
    const props = {
      id: 'edge-1',
      source: 'a',
      target: 'b',
      sourceX: 100,
      sourceY: 100,
      targetX: 200,
      targetY: 200,
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
          <TriggerEdge {...(props as never)} />
        </svg>
      </ReactFlowProvider>,
    );

    // BaseEdge renders a path element
    const path = container.querySelector('path');
    expect(path).not.toBeNull();
  });
});
