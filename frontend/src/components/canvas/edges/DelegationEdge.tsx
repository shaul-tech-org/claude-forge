import { BaseEdge, getSmoothStepPath, type EdgeProps } from '@xyflow/react';
import type { ForgeEdgeData } from '../../../types/edge';

type DelegationEdgeProps = EdgeProps & { data?: ForgeEdgeData };

export function DelegationEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
}: DelegationEdgeProps) {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      markerEnd={markerEnd}
      style={{ stroke: '#6b7280', strokeWidth: 2.5 }}
    />
  );
}
