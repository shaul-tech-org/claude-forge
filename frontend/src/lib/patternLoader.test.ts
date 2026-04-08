import { describe, it, expect } from 'vitest';
import { autoLayoutNodes } from './patternLoader';
import type { Node, Edge } from '@xyflow/react';

describe('autoLayoutNodes', () => {
  it('assigns positions by level', () => {
    const nodes: Node[] = [
      { id: 'a', position: { x: 0, y: 0 }, data: {} },
      { id: 'b', position: { x: 0, y: 0 }, data: {} },
      { id: 'c', position: { x: 0, y: 0 }, data: {} },
    ];
    const edges: Edge[] = [
      { id: 'e1', source: 'a', target: 'b' },
      { id: 'e2', source: 'b', target: 'c' },
    ];

    const result = autoLayoutNodes(nodes, edges);

    // a should be at level 0, b at level 1, c at level 2
    expect(result[0].position.y).toBeLessThan(result[1].position.y);
    expect(result[1].position.y).toBeLessThan(result[2].position.y);
  });

  it('handles single node', () => {
    const nodes: Node[] = [
      { id: 'a', position: { x: 0, y: 0 }, data: {} },
    ];
    const edges: Edge[] = [];

    const result = autoLayoutNodes(nodes, edges);

    expect(result).toHaveLength(1);
    expect(result[0].position).toBeDefined();
  });

  it('handles disconnected nodes', () => {
    const nodes: Node[] = [
      { id: 'a', position: { x: 0, y: 0 }, data: {} },
      { id: 'b', position: { x: 0, y: 0 }, data: {} },
    ];
    const edges: Edge[] = [];

    const result = autoLayoutNodes(nodes, edges);

    expect(result).toHaveLength(2);
    // Both roots should be at the same level
    expect(result[0].position.y).toBe(result[1].position.y);
  });

  it('positions fan-out nodes side by side', () => {
    const nodes: Node[] = [
      { id: 'root', position: { x: 0, y: 0 }, data: {} },
      { id: 'left', position: { x: 0, y: 0 }, data: {} },
      { id: 'right', position: { x: 0, y: 0 }, data: {} },
    ];
    const edges: Edge[] = [
      { id: 'e1', source: 'root', target: 'left' },
      { id: 'e2', source: 'root', target: 'right' },
    ];

    const result = autoLayoutNodes(nodes, edges);

    // left and right should be on the same Y level
    const leftNode = result.find((n) => n.id === 'left')!;
    const rightNode = result.find((n) => n.id === 'right')!;
    expect(leftNode.position.y).toBe(rightNode.position.y);
    // but different X positions
    expect(leftNode.position.x).not.toBe(rightNode.position.x);
  });
});
