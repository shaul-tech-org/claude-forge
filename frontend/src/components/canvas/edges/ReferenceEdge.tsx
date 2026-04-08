import { BaseEdge, getSmoothStepPath, type EdgeProps } from '@xyflow/react';

export function ReferenceEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
}: EdgeProps) {
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
      style={{
        stroke: '#9ca3af',
        strokeWidth: 1.5,
        strokeDasharray: '8 6',
      }}
    />
  );
}
