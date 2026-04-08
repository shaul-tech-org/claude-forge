import type { Node, Edge } from '@xyflow/react';
import { fetchPattern } from '../api/harness';
import { generateId } from './id';

interface PatternDiagramNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: Record<string, string>;
}

interface PatternDiagramEdge {
  id: string;
  source: string;
  target: string;
  type: string;
}

/**
 * Load a pattern template and convert to React Flow nodes/edges
 * with auto-layout offsets applied.
 */
export async function loadPatternTemplate(
  patternId: string,
  offsetX = 100,
  offsetY = 100,
): Promise<{ nodes: Node[]; edges: Edge[] }> {
  const pattern = await fetchPattern(patternId);

  if (!pattern?.diagram) {
    return { nodes: [], edges: [] };
  }

  const idMap = new Map<string, string>();
  const diagramNodes: PatternDiagramNode[] = pattern.diagram.nodes ?? [];
  const diagramEdges: PatternDiagramEdge[] = pattern.diagram.edges ?? [];

  // Generate new IDs to avoid conflicts with existing canvas nodes
  for (const node of diagramNodes) {
    idMap.set(node.id, generateId());
  }

  const nodes: Node[] = diagramNodes.map((node) => ({
    id: idMap.get(node.id) ?? generateId(),
    type: node.type,
    position: {
      x: node.position.x + offsetX,
      y: node.position.y + offsetY,
    },
    data: {
      label: node.data.label ?? '',
      description: node.data.description ?? '',
      model: node.data.model,
    },
  }));

  const edges: Edge[] = diagramEdges.map((edge) => ({
    id: generateId(),
    source: idMap.get(edge.source) ?? edge.source,
    target: idMap.get(edge.target) ?? edge.target,
    type: edge.type,
  }));

  return { nodes, edges };
}

/**
 * Apply dagre-like simple layout to nodes.
 * Simple top-down layout with horizontal centering per level.
 */
export function autoLayoutNodes(
  nodes: Node[],
  edges: Edge[],
  nodeWidth = 200,
  nodeHeight = 80,
  gapX = 60,
  gapY = 120,
): Node[] {
  // Build adjacency for topological levels
  const children = new Map<string, string[]>();
  const parents = new Map<string, string[]>();

  for (const node of nodes) {
    children.set(node.id, []);
    parents.set(node.id, []);
  }

  for (const edge of edges) {
    children.get(edge.source)?.push(edge.target);
    parents.get(edge.target)?.push(edge.source);
  }

  // Assign levels via BFS
  const roots = nodes.filter((n) => (parents.get(n.id)?.length ?? 0) === 0);
  const levels = new Map<string, number>();
  const queue = roots.map((r) => r.id);
  for (const id of queue) {
    if (!levels.has(id)) levels.set(id, 0);
  }

  for (const id of queue) {
    const level = levels.get(id) ?? 0;
    for (const child of children.get(id) ?? []) {
      const existing = levels.get(child) ?? -1;
      if (level + 1 > existing) {
        levels.set(child, level + 1);
        queue.push(child);
      }
    }
  }

  // Group by level
  const byLevel = new Map<number, string[]>();
  for (const [id, level] of levels) {
    if (!byLevel.has(level)) byLevel.set(level, []);
    byLevel.get(level)!.push(id);
  }

  // Position nodes
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const maxLevel = Math.max(...byLevel.keys(), 0);

  for (let level = 0; level <= maxLevel; level++) {
    const ids = byLevel.get(level) ?? [];
    const totalWidth = ids.length * nodeWidth + (ids.length - 1) * gapX;
    const startX = -totalWidth / 2;

    ids.forEach((id, i) => {
      const node = nodeMap.get(id);
      if (node) {
        node.position = {
          x: startX + i * (nodeWidth + gapX) + 400,
          y: level * (nodeHeight + gapY) + 100,
        };
      }
    });
  }

  return nodes;
}
