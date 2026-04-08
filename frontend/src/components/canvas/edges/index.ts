import type { EdgeTypes } from '@xyflow/react';
import { ForgeEdgeComponent } from './ForgeEdge';
import { TriggerEdge } from './TriggerEdge';
import { ReferenceEdge } from './ReferenceEdge';
import { LoadEdge } from './LoadEdge';

export const edgeTypes: EdgeTypes = {
  delegation: ForgeEdgeComponent,
  uses: ForgeEdgeComponent,
  applies: ForgeEdgeComponent,
  trigger: TriggerEdge,
  reference: ReferenceEdge,
  load: LoadEdge,
};

export const defaultEdgeOptions = {
  animated: true,
  type: 'smoothstep' as const,
};
