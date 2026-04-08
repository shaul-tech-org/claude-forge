import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ReactFlow, Background, Controls, MiniMap } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { fetchPattern, type PatternDetail } from '../api/harness';
import { nodeTypes } from '../components/canvas/nodes';
import { edgeTypes } from '../components/canvas/edges';

const AXIS_LABELS: Record<string, string> = {
  context: 'Context Engineering',
  verification: 'Verification Loops',
  state: 'State Management',
  tools: 'Tool Orchestration',
  human: 'Human-in-the-Loop',
  lifecycle: 'Lifecycle Management',
};

const CATEGORY_LABELS: Record<string, string> = {
  starter: 'Starter',
  team: 'Team',
  domain: 'Domain',
  workflow: 'Workflow',
  advanced: 'Advanced',
};

function ScoreBar({ label, score }: { label: string; score: number }) {
  const color = score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-3">
      <span className="w-40 text-sm text-gray-600">{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="w-8 text-right text-sm font-semibold text-gray-700">{score}</span>
    </div>
  );
}

export function PatternDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pattern, setPattern] = useState<PatternDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchPattern(id).then((data) => {
        setPattern(data);
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!pattern) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
        <p className="text-gray-500">Pattern not found</p>
        <button onClick={() => navigate('/patterns')} className="mt-4 text-blue-600 hover:underline">Back to patterns</button>
      </div>
    );
  }

  const diagramNodes = (pattern.diagram?.nodes ?? []).map((n) => ({
    ...n,
    data: { ...n.data, label: n.data.label ?? '', description: n.data.description ?? '' },
  }));
  const diagramEdges = pattern.diagram?.edges ?? [];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white px-8 py-6">
        <div className="mx-auto max-w-5xl">
          <button onClick={() => navigate('/patterns')} className="mb-2 text-sm text-blue-600 hover:underline">&larr; Patterns</button>
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">{pattern.name}</h1>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
              {CATEGORY_LABELS[pattern.category] ?? pattern.category}
            </span>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
              Team: {pattern.team_size}
            </span>
            <span className="rounded-full bg-yellow-50 px-3 py-1 text-xs font-medium text-yellow-600">
              {pattern.complexity}
            </span>
          </div>
          <p className="mt-2 text-sm text-gray-500">{pattern.description}</p>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-8 py-8">
        <div className="grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Architecture Diagram</h2>
            <div className="h-96 overflow-hidden rounded-xl border bg-white">
              <ReactFlow
                nodes={diagramNodes}
                edges={diagramEdges}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                fitView
                proOptions={{ hideAttribution: true }}
              >
                <Background />
                <Controls showInteractive={false} />
                <MiniMap />
              </ReactFlow>
            </div>
          </div>
          <div className="space-y-6 lg:col-span-2">
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Expected 6-Axis Scores</h2>
              <div className="space-y-2 rounded-xl border bg-white p-4">
                {Object.entries(pattern.expected_scores).map(([axis, score]) => (
                  <ScoreBar key={axis} label={AXIS_LABELS[axis] ?? axis} score={score} />
                ))}
              </div>
            </div>
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Recommended Agents</h2>
              <div className="flex flex-wrap gap-2">
                {pattern.recommended_agents.map((a) => (
                  <span key={a} className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700">{a}</span>
                ))}
              </div>
            </div>
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Recommended Skills</h2>
              <div className="flex flex-wrap gap-2">
                {pattern.recommended_skills.map((s) => (
                  <span key={s} className="rounded-lg bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700">{s}</span>
                ))}
              </div>
            </div>
            <button
              onClick={() => {
                localStorage.setItem('claude-forge-load-pattern', pattern.id);
                navigate('/create/builder');
              }}
              className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Start with this pattern
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
