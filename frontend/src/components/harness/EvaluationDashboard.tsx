import { useState } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { evaluateHarness, type EvaluationResult } from '../../api/harness';
import { useCanvasContext } from '../../contexts/CanvasContext';

const AXIS_LABELS: Record<string, string> = {
  context: 'Context Engineering',
  verification: 'Verification Loops',
  state: 'State Management',
  tools: 'Tool Orchestration',
  human: 'Human-in-the-Loop',
  lifecycle: 'Lifecycle Management',
};

const GRADE_COLORS: Record<string, string> = {
  S: 'text-purple-600 bg-purple-50 border-purple-200',
  A: 'text-green-600 bg-green-50 border-green-200',
  B: 'text-blue-600 bg-blue-50 border-blue-200',
  C: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  D: 'text-red-600 bg-red-50 border-red-200',
};

export function EvaluationDashboard({ onClose }: { onClose: () => void }) {
  const { nodes, projectConfig } = useCanvasContext();
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEvaluate = async () => {
    setLoading(true);
    const agents = nodes
      .filter((n) => n.type === 'agent')
      .map((n) => ({ label: n.data.label, description: n.data.description, instructions: n.data.instructions }));
    const skills = nodes
      .filter((n) => n.type === 'skill')
      .map((n) => ({ label: n.data.label, description: n.data.description, userInvocable: n.data.userInvocable }));
    const rules = nodes
      .filter((n) => n.type === 'rule')
      .map((n) => ({ label: n.data.label, description: n.data.description, paths: n.data.paths, content: n.data.content }));

    const evaluation = await evaluateHarness({
      agents,
      skills,
      rules,
      hooks: {},
      settings: {},
      claudeMd: projectConfig.claudeMd,
    });
    setResult(evaluation);
    setLoading(false);
  };

  const radarData = result
    ? Object.entries(result.scores).map(([axis, score]) => ({
        axis: AXIS_LABELS[axis] ?? axis,
        score: score.score,
        fullMark: 100,
      }))
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b bg-white px-6 py-4">
          <h2 className="text-lg font-bold text-gray-900">6-Axis Harness Evaluation</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-6">
          {!result && (
            <div className="flex flex-col items-center gap-4 py-12">
              <p className="text-sm text-gray-500">현재 캔버스의 하네스 구성을 6축 프레임워크로 평가합니다.</p>
              <button
                onClick={handleEvaluate}
                disabled={loading}
                className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Evaluating...' : 'Evaluate Now'}
              </button>
            </div>
          )}
          {result && (
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <div className={`flex h-20 w-20 items-center justify-center rounded-2xl border-2 text-3xl font-black ${GRADE_COLORS[result.grade]}`}>
                  {result.grade}
                </div>
                <div>
                  <div className="text-sm text-gray-500">Overall Score</div>
                  <div className="text-3xl font-bold text-gray-900">{result.overall}<span className="text-lg text-gray-400">/100</span></div>
                  <div className="mt-1 text-xs text-gray-500">Priority: <span className="font-medium text-blue-600">{AXIS_LABELS[result.top_priority]}</span></div>
                </div>
              </div>
              <div className="flex justify-center">
                <ResponsiveContainer width="100%" height={320}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="axis" tick={{ fontSize: 11, fill: '#6b7280' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Radar name="Score" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                {Object.entries(result.scores).map(([axis, score]) => (
                  <div key={axis} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{AXIS_LABELS[axis]}</span>
                      <div className="flex items-center gap-2">
                        <span className={`rounded px-1.5 py-0.5 text-xs font-bold ${GRADE_COLORS[score.grade]}`}>{score.grade}</span>
                        <span className="text-sm font-semibold text-gray-700">{score.score}</span>
                      </div>
                    </div>
                    {score.suggestions.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {score.suggestions.map((s, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-xs text-gray-500">
                            <span className="mt-0.5 text-yellow-500">&#9679;</span>
                            {s}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={handleEvaluate}
                disabled={loading}
                className="w-full rounded-lg border border-blue-200 bg-blue-50 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-100"
              >
                Re-evaluate
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
