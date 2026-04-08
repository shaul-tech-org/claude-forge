const API_BASE = '/api/v1';

export interface TechStack {
  id: string;
  name: string;
  category: string;
  implies: string[];
}

export interface RuleTemplate {
  label: string;
  category: string;
  paths: string[];
  content: string;
}

export interface SkillTemplate {
  name: string;
  description: string;
  userInvocable: boolean;
  instructions: string;
}

export interface RecommendationResult {
  stacks: TechStack[];
  rules: RuleTemplate[];
  skills: SkillTemplate[];
}

export async function fetchStacks(): Promise<TechStack[]> {
  const resp = await fetch(`${API_BASE}/stacks`, {
    headers: { Accept: 'application/json' },
  });
  const data = await resp.json();
  return data.data ?? data;
}

export async function fetchRecommendations(stackIds: string[]): Promise<RecommendationResult> {
  const resp = await fetch(`${API_BASE}/recommendations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ stacks: stackIds }),
  });
  const data = await resp.json();
  return data.data ?? data;
}
