import type { EdgeTypes } from '@xyflow/react';
import { ForgeEdgeComponent } from './ForgeEdge';

export const edgeTypes: EdgeTypes = {
  delegation: ForgeEdgeComponent,
  uses: ForgeEdgeComponent,
  applies: ForgeEdgeComponent,
};

export const defaultEdgeOptions = {
  animated: true,
  type: 'smoothstep' as const,
};
