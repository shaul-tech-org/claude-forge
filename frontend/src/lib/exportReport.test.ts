import { describe, it, expect } from 'vitest';
import type { Node, Edge } from '@xyflow/react';
import type { EvaluationResult } from '../api/harness';
import { generateExportReport } from './exportReport';

function makeAgentNode(id: string, label: string): Node {
  return {
    id,
    type: 'agent',
    position: { x: 0, y: 0 },
    data: { label, description: 'Test agent', model: 'sonnet', instructions: 'Do things' },
  };
}

describe('generateExportReport', () => {
  it('creates a zip blob', async () => {
    const nodes: Node[] = [makeAgentNode('1', 'Coder')];
    const edges: Edge[] = [];
    const claudeMd = '# My Project';
    const evaluation: EvaluationResult = {
      scores: {
        context: { axis: 'context', score: 80, grade: 'A', checklist: {}, suggestions: [] },
      },
      overall: 80,
      grade: 'A',
      top_priority: 'verification',
    };

    const blob = await generateExportReport(nodes, edges, claudeMd, evaluation, 'test-project');

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(0);
  });

  it('creates a zip blob without evaluation', async () => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    const blob = await generateExportReport(nodes, edges, '# Empty', null, 'empty-project');

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(0);
  });
});
