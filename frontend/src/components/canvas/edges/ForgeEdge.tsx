import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
} from '@xyflow/react';
import type { ForgeEdgeData, ForgeEdgeType } from '../../../types/edge';

const EDGE_STYLES: Record<ForgeEdgeType, { stroke: string; strokeWidth: number; label: string }> = {
  delegation: { stroke: '#6b7280', strokeWidth: 2.5, label: 'delegates' },
  uses:       { stroke: '#22c55e', strokeWidth: 1.5, label: 'uses' },
  applies:    { stroke: '#f59e0b', strokeWidth: 1.5, label: 'applies' },
};

type ForgeEdgeProps = EdgeProps & { data?: ForgeEdgeData };

export function ForgeEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
}: ForgeEdgeProps) {
  const relationship = data?.relationship ?? 'uses';
  const style = EDGE_STYLES[relationship];

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{ stroke: style.stroke, strokeWidth: style.strokeWidth }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${String(labelX)}px, ${String(labelY)}px)`,
            pointerEvents: 'all',
          }}
          className="rounded bg-white px-1.5 py-0.5 text-[10px] font-medium shadow-sm"
        >
          <span style={{ color: style.stroke }}>{style.label}</span>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
