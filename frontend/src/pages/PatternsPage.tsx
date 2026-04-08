import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchPatterns, type PatternSummary } from '../api/harness';

const CATEGORY_LABELS: Record<string, string> = {
  starter: 'Starter',
  team: 'Team',
  domain: 'Domain',
  workflow: 'Workflow',
  advanced: 'Advanced',
};

const COMPLEXITY_COLORS: Record<string, string> = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700',
};

const AXIS_LABELS: Record<string, string> = {
  context: 'Context',
  verification: 'Verification',
  state: 'State',
  tools: 'Tools',
  human: 'Human',
  lifecycle: 'Lifecycle',
};

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600';
  return <span className={`text-xs font-semibold ${color}`}>{score}</span>;
}

function PatternCard({ pattern, onClick }: { pattern: PatternSummary; onClick: () => void }) {
  const avgScore = Math.round(
    Object.values(pattern.expected_scores).reduce((a, b) => a + b, 0) /
    Object.values(pattern.expected_scores).length
  );

  return (
    <button
      onClick={onClick}
      className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:border-blue-300 hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">{pattern.name}</h3>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${COMPLEXITY_COLORS[pattern.complexity] ?? 'bg-gray-100'}`}>
          {pattern.complexity}
        </span>
      </div>
      <p className="text-sm leading-relaxed text-gray-600">{pattern.description}</p>
      <div className="flex items-center gap-3 text-xs text-gray-500">
        <span className="rounded bg-gray-100 px-2 py-0.5">{CATEGORY_LABELS[pattern.category] ?? pattern.category}</span>
        <span>Team: {pattern.team_size}</span>
        <span>Avg: <ScoreBadge score={avgScore} /></span>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {Object.entries(pattern.expected_scores).map(([axis, score]) => (
          <div key={axis} className="flex items-center justify-between rounded bg-gray-50 px-2 py-1">
            <span className="text-[10px] text-gray-500">{AXIS_LABELS[axis] ?? axis}</span>
            <ScoreBadge score={score} />
          </div>
        ))}
      </div>
    </button>
  );
}

export function PatternsPage() {
  const navigate = useNavigate();
  const [patterns, setPatterns] = useState<PatternSummary[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatterns().then((result) => {
      setPatterns(Array.isArray(result.data) ? result.data : []);
      setCategories(Array.isArray(result.categories) ? result.categories : []);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  const filtered = selectedCategory
    ? patterns.filter((p) => p.category === selectedCategory)
    : patterns;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white px-8 py-6">
        <div className="mx-auto max-w-6xl">
          <button onClick={() => navigate('/')} className="mb-2 text-sm text-blue-600 hover:underline">&larr; Home</button>
          <h1 className="text-2xl font-bold text-gray-900">Pattern Library</h1>
          <p className="mt-1 text-sm text-gray-500">AI 하네스 아키텍처 패턴을 탐색하고 프로젝트에 적용하세요.</p>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-8 py-8">
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              selectedCategory === null ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {CATEGORY_LABELS[cat] ?? cat}
            </button>
          ))}
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((pattern) => (
              <PatternCard
                key={pattern.id}
                pattern={pattern}
                onClick={() => navigate(`/patterns/${pattern.id}`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
