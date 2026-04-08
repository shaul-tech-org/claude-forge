const API_BASE = '/api/v1';

export interface PatternSummary {
  id: string;
  name: string;
  category: string;
  description: string;
  team_size: string;
  complexity: string;
  expected_scores: Record<string, number>;
}

export interface PatternDetail extends PatternSummary {
  diagram: {
    nodes: Array<{
      id: string;
      type: string;
      position: { x: number; y: number };
      data: Record<string, string>;
    }>;
    edges: Array<{
      id: string;
      source: string;
      target: string;
      type: string;
    }>;
  };
  recommended_agents: string[];
  recommended_skills: string[];
}

export interface AxisScore {
  axis: string;
  score: number;
  grade: string;
  checklist: Record<string, boolean>;
  suggestions: string[];
}

export interface EvaluationResult {
  scores: Record<string, AxisScore>;
  overall: number;
  grade: string;
  top_priority: string;
}

export interface ContextBudgetResult {
  total_capacity: number;
  fixed_usage: number;
  available: number;
  utilization: number;
  breakdown: Record<string, number>;
  warnings: string[];
}

export interface HarnessRecommendation {
  patterns: PatternSummary[];
  rules: Array<{ label: string; category: string; paths: string[]; content: string }>;
  skills: Array<{ name: string; description: string }>;
  stacks: Array<{ id: string; name: string; category: string }>;
}

export async function fetchPatterns(): Promise<{ data: PatternSummary[]; categories: string[] }> {
  const resp = await fetch(`${API_BASE}/patterns`, {
    headers: { Accept: 'application/json' },
  });
  return await resp.json() as { data: PatternSummary[]; categories: string[] };
}

export async function fetchPattern(id: string): Promise<PatternDetail> {
  const resp = await fetch(`${API_BASE}/patterns/${id}`, {
    headers: { Accept: 'application/json' },
  });
  const result = await resp.json() as { data: PatternDetail };
  return result.data;
}

export async function evaluateHarness(harness: Record<string, unknown>): Promise<EvaluationResult> {
  const resp = await fetch(`${API_BASE}/harness/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(harness),
  });
  const result = await resp.json() as { data: EvaluationResult };
  return result.data;
}

export async function calculateContextBudget(config: Record<string, unknown>): Promise<ContextBudgetResult> {
  const resp = await fetch(`${API_BASE}/harness/context-budget`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(config),
  });
  const result = await resp.json() as { data: ContextBudgetResult };
  return result.data;
}

export async function recommendHarness(params: {
  stacks?: string[];
  teamSize?: number;
  priorities?: string[];
}): Promise<HarnessRecommendation> {
  const resp = await fetch(`${API_BASE}/harness/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(params),
  });
  const result = await resp.json() as { data: HarnessRecommendation };
  return result.data;
}
