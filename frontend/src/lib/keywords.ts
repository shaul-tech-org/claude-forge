import type { ForgeNodeData } from '../types/node';

export interface KeywordMatch {
  keyword: string;
  stackId: string;
  color: string;
}

const KEYWORD_MAP: { pattern: RegExp; stackId: string; keyword: string; color: string }[] = [
  { pattern: /react/i, stackId: 'react', keyword: 'React', color: 'bg-sky-100 text-sky-700' },
  { pattern: /next\.?js|app\s*router/i, stackId: 'nextjs', keyword: 'Next.js', color: 'bg-gray-100 text-gray-700' },
  { pattern: /vue/i, stackId: 'vue', keyword: 'Vue.js', color: 'bg-emerald-100 text-emerald-700' },
  { pattern: /svelte/i, stackId: 'svelte', keyword: 'Svelte', color: 'bg-orange-100 text-orange-700' },
  { pattern: /tailwind/i, stackId: 'tailwind', keyword: 'Tailwind', color: 'bg-cyan-100 text-cyan-700' },
  { pattern: /typescript|\.tsx?|strict/i, stackId: 'typescript', keyword: 'TypeScript', color: 'bg-blue-100 text-blue-700' },
  { pattern: /laravel|eloquent|artisan|migration/i, stackId: 'laravel', keyword: 'Laravel', color: 'bg-red-100 text-red-700' },
  { pattern: /php|psr-?12|strict_types/i, stackId: 'php', keyword: 'PHP', color: 'bg-indigo-100 text-indigo-700' },
  { pattern: /express|node\.?js/i, stackId: 'express', keyword: 'Express', color: 'bg-green-100 text-green-700' },
  { pattern: /django/i, stackId: 'django', keyword: 'Django', color: 'bg-green-100 text-green-700' },
  { pattern: /fastapi/i, stackId: 'fastapi', keyword: 'FastAPI', color: 'bg-teal-100 text-teal-700' },
  { pattern: /spring/i, stackId: 'spring', keyword: 'Spring', color: 'bg-lime-100 text-lime-700' },
  { pattern: /python/i, stackId: 'python', keyword: 'Python', color: 'bg-yellow-100 text-yellow-700' },
  { pattern: /\bgo\b|golang/i, stackId: 'go', keyword: 'Go', color: 'bg-cyan-100 text-cyan-700' },
  { pattern: /rust/i, stackId: 'rust', keyword: 'Rust', color: 'bg-orange-100 text-orange-700' },
  { pattern: /java(?!script)/i, stackId: 'java', keyword: 'Java', color: 'bg-red-100 text-red-700' },
  { pattern: /docker|container|compose/i, stackId: 'docker', keyword: 'Docker', color: 'bg-blue-100 text-blue-700' },
  { pattern: /github\s*actions|ci\/cd|workflow/i, stackId: 'github-actions', keyword: 'GitHub Actions', color: 'bg-gray-100 text-gray-700' },
  { pattern: /kubernetes|k8s/i, stackId: 'kubernetes', keyword: 'Kubernetes', color: 'bg-blue-100 text-blue-700' },
  { pattern: /terraform/i, stackId: 'terraform', keyword: 'Terraform', color: 'bg-purple-100 text-purple-700' },
  { pattern: /test|pest|vitest|jest/i, stackId: '', keyword: 'Testing', color: 'bg-amber-100 text-amber-700' },
  { pattern: /api|endpoint|rest/i, stackId: '', keyword: 'API', color: 'bg-violet-100 text-violet-700' },
  { pattern: /database|db|sql|eloquent|migration/i, stackId: '', keyword: 'Database', color: 'bg-rose-100 text-rose-700' },
  { pattern: /auth|jwt|session|oauth/i, stackId: '', keyword: 'Auth', color: 'bg-pink-100 text-pink-700' },
  { pattern: /hook|useState|useEffect/i, stackId: '', keyword: 'Hooks', color: 'bg-sky-100 text-sky-700' },
  { pattern: /component|memo|render/i, stackId: '', keyword: 'Components', color: 'bg-green-100 text-green-700' },
];

export function extractKeywords(data: ForgeNodeData): KeywordMatch[] {
  const text = [
    data.label,
    data.description,
    'instructions' in data ? String(data.instructions ?? '') : '',
    'content' in data ? String(data.content ?? '') : '',
    'trigger' in data ? String(data.trigger ?? '') : '',
    'category' in data ? String(data.category ?? '') : '',
    ...(('paths' in data && Array.isArray(data.paths)) ? data.paths.map(String) : []),
  ].join(' ');

  const seen = new Set<string>();
  const matches: KeywordMatch[] = [];

  for (const entry of KEYWORD_MAP) {
    if (entry.pattern.test(text) && !seen.has(entry.keyword)) {
      seen.add(entry.keyword);
      matches.push({
        keyword: entry.keyword,
        stackId: entry.stackId,
        color: entry.color,
      });
    }
  }

  return matches;
}
