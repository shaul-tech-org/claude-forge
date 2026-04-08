import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  fetchPatterns,
  fetchPattern,
  evaluateHarness,
  calculateContextBudget,
  recommendHarness,
} from './harness';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

beforeEach(() => {
  mockFetch.mockReset();
});

function jsonResponse(data: unknown) {
  return { json: () => Promise.resolve(data) };
}

describe('harness API client', () => {
  it('fetchPatterns returns patterns and categories', async () => {
    const payload = {
      data: [{ id: '1', name: 'Solo', category: 'basic', description: '', team_size: '1', complexity: 'low', expected_scores: {} }],
      categories: ['basic'],
    };
    mockFetch.mockResolvedValueOnce(jsonResponse(payload));

    const result = await fetchPatterns();

    expect(mockFetch).toHaveBeenCalledWith('/api/v1/patterns', {
      headers: { Accept: 'application/json' },
    });
    expect(result.data).toHaveLength(1);
    expect(result.data[0].name).toBe('Solo');
    expect(result.categories).toEqual(['basic']);
  });

  it('fetchPattern returns pattern detail', async () => {
    const detail = {
      id: 'solo',
      name: 'Solo',
      category: 'basic',
      description: 'Single agent',
      team_size: '1',
      complexity: 'low',
      expected_scores: {},
      diagram: { nodes: [], edges: [] },
      recommended_agents: [],
      recommended_skills: [],
    };
    mockFetch.mockResolvedValueOnce(jsonResponse({ data: detail }));

    const result = await fetchPattern('solo');

    expect(mockFetch).toHaveBeenCalledWith('/api/v1/patterns/solo', {
      headers: { Accept: 'application/json' },
    });
    expect(result.name).toBe('Solo');
    expect(result.id).toBe('solo');
  });

  it('evaluateHarness sends POST and returns result', async () => {
    const evalResult = {
      scores: {},
      overall: 75,
      grade: 'B',
      top_priority: 'context',
    };
    mockFetch.mockResolvedValueOnce(jsonResponse({ data: evalResult }));

    const harness = { projectName: 'test' };
    const result = await evaluateHarness(harness);

    expect(mockFetch).toHaveBeenCalledWith('/api/v1/harness/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(harness),
    });
    expect(result.overall).toBe(75);
    expect(result.grade).toBe('B');
  });

  it('calculateContextBudget returns budget data', async () => {
    const budget = {
      total_capacity: 200000,
      fixed_usage: 50000,
      available: 150000,
      utilization: 0.25,
      breakdown: { claudeMd: 10000 },
      warnings: [],
    };
    mockFetch.mockResolvedValueOnce(jsonResponse({ data: budget }));

    const config = { agents: 3 };
    const result = await calculateContextBudget(config);

    expect(mockFetch).toHaveBeenCalledWith('/api/v1/harness/context-budget', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(config),
    });
    expect(result.total_capacity).toBe(200000);
    expect(result.available).toBe(150000);
    expect(result.utilization).toBe(0.25);
  });

  it('recommendHarness sends correct params', async () => {
    const recommendation = {
      patterns: [],
      rules: [],
      skills: [],
      stacks: [],
    };
    mockFetch.mockResolvedValueOnce(jsonResponse({ data: recommendation }));

    const params = { stacks: ['react'], teamSize: 3, priorities: ['quality'] };
    const result = await recommendHarness(params);

    expect(mockFetch).toHaveBeenCalledWith('/api/v1/harness/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(params),
    });
    expect(result.patterns).toEqual([]);
    expect(result.skills).toEqual([]);
  });
});
