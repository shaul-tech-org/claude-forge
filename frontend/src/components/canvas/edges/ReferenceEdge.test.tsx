import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ReactFlowProvider, Position } from '@xyflow/react';
import { ReferenceEdge } from './ReferenceEdge';

describe('ReferenceEdge', () => {
  it('renders reference edge', () => {
    const props = {
      id: 'edge-ref-1',
      source: 'a',
      target: 'b',
      sourceX: 50,
      sourceY: 50,
      targetX: 150,
      targetY: 150,
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
          <ReferenceEdge {...(props as never)} />
        </svg>
      </ReactFlowProvider>,
    );

    const path = container.querySelector('path');
    expect(path).not.toBeNull();
  });
});
