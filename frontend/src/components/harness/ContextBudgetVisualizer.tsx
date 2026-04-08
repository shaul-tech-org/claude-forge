import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { calculateContextBudget, type ContextBudgetResult } from '../../api/harness';
import { useCanvasContext } from '../../contexts/CanvasContext';

const SEGMENT_COLORS: Record<string, string> = {
  system_prompt: '#6366f1',
  system_tools: '#8b5cf6',
  claude_md: '#3b82f6',
  rules: '#10b981',
  agents: '#f59e0b',
  skills: '#06b6d4',
  hooks: '#ef4444',
  memory: '#ec4899',
};

const SEGMENT_LABELS: Record<string, string> = {
  system_prompt: 'System Prompt',
  system_tools: 'System Tools',
  claude_md: 'CLAUDE.md',
  rules: 'Rules',
  agents: 'Agents',
  skills: 'Skills',
  hooks: 'Hooks',
  memory: 'Memory',
};

function formatTokens(tokens: number): string {
  if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}K`;
  return tokens.toString();
}

export function ContextBudgetVisualizer({ onClose }: { onClose: () => void }) {
  const { nodes, projectConfig } = useCanvasContext();
  const [result, setResult] = useState<ContextBudgetResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCalculate = async () => {
    setLoading(true);
    const agents = nodes
      .filter((n) => n.type === 'agent')
      .map((n) => ({ instructions: n.data.instructions ?? '' }));
    const rules = nodes
      .filter((n) => n.type === 'rule')
      .map((n) => ({ content: n.data.content ?? '' }));
    const skills = nodes.filter((n) => n.type === 'skill');

    const budget = await calculateContextBudget({
      agents,
      rules,
      skills,
      hooks: {},
      claudeMd: projectConfig.claudeMd,
      memory: false,
    });
    setResult(budget);
    setLoading(false);
  };

  const chartData = result
    ? Object.entries(result.breakdown)
        .filter(([, tokens]) => tokens > 0)
        .map(([key, tokens]) => ({
          name: SEGMENT_LABELS[key] ?? key,
          tokens,
          color: SEGMENT_COLORS[key] ?? '#9ca3af',
        }))
    : [];

  const utilizationPercent = result ? (result.utilization * 100).toFixed(1) : '0';
  const utilizationColor = result
    ? result.utilization > 0.3 ? 'text-red-600' : result.utilization > 0.15 ? 'text-yellow-600' : 'text-green-600'
    : 'text-gray-400';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b bg-white px-6 py-4">
          <h2 className="text-lg font-bold text-gray-900">Context Budget</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-6">
          {!result && (
            <div className="flex flex-col items-center gap-4 py-12">
              <p className="text-sm text-gray-500">현재 캔버스 구성의 고정 토큰 사용량을 계산합니다.</p>
              <button
                onClick={handleCalculate}
                disabled={loading}
                className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Calculating...' : 'Calculate Budget'}
              </button>
            </div>
          )}
          {result && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-xl bg-gray-50 p-4 text-center">
                  <div className="text-xs text-gray-500">Total Capacity</div>
                  <div className="text-xl font-bold text-gray-900">{formatTokens(result.total_capacity)}</div>
                </div>
                <div className="rounded-xl bg-gray-50 p-4 text-center">
                  <div className="text-xs text-gray-500">Fixed Usage</div>
                  <div className="text-xl font-bold text-gray-900">{formatTokens(result.fixed_usage)}</div>
                </div>
                <div className="rounded-xl bg-gray-50 p-4 text-center">
                  <div className="text-xs text-gray-500">Utilization</div>
                  <div className={`text-xl font-bold ${utilizationColor}`}>{utilizationPercent}%</div>
                </div>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className={`h-full rounded-full transition-all ${
                    result.utilization > 0.3 ? 'bg-red-500' : result.utilization > 0.15 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(result.utilization * 100, 100)}%` }}
                />
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData} layout="vertical" margin={{ left: 100 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={formatTokens} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={90} />
                  <Tooltip formatter={(value: number) => [`${formatTokens(value)} tokens`, 'Usage']} />
                  <Bar dataKey="tokens" radius={[0, 4, 4, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              {result.warnings.length > 0 && (
                <div className="space-y-2">
                  {result.warnings.map((w, i) => (
                    <div key={i} className="flex items-start gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-xs text-yellow-800">
                      <span className="mt-0.5">&#9888;</span>
                      {w}
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between rounded-lg bg-green-50 p-4">
                <span className="text-sm text-green-700">Available for conversation</span>
                <span className="text-lg font-bold text-green-700">{formatTokens(result.available)}</span>
              </div>
              <button
                onClick={handleCalculate}
                disabled={loading}
                className="w-full rounded-lg border border-blue-200 bg-blue-50 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-100"
              >
                Recalculate
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
