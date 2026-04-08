import type { Edge } from '@xyflow/react';

export const FORGE_EDGE_TYPES = ['delegation', 'uses', 'applies'] as const;
export type ForgeEdgeType = (typeof FORGE_EDGE_TYPES)[number];

export interface ForgeEdgeData {
  relationship: ForgeEdgeType;
  [key: string]: unknown;
}

export type ForgeEdge = Edge<ForgeEdgeData>;
