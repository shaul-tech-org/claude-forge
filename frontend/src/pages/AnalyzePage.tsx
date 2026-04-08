import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { evaluateHarness, type EvaluationResult } from '../api/harness';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import JSZip from 'jszip';

const AXIS_LABELS: Record<string, string> = {
  context: 'Context',
  verification: 'Verification',
  state: 'State',
  tools: 'Tools',
  human: 'Human',
  lifecycle: 'Lifecycle',
};

const GRADE_COLORS: Record<string, string> = {
  S: 'text-purple-600 bg-purple-50',
  A: 'text-green-600 bg-green-50',
  B: 'text-blue-600 bg-blue-50',
  C: 'text-yellow-600 bg-yellow-50',
  D: 'text-red-600 bg-red-50',
};

interface ParsedHarness {
  agents: Array<Record<string, unknown>>;
  skills: Array<Record<string, unknown>>;
  rules: Array<Record<string, unknown>>;
  claudeMd: string;
}

async function parseZip(file: File): Promise<ParsedHarness> {
  const zip = await JSZip.loadAsync(file);
  const harness: ParsedHarness = { agents: [], skills: [], rules: [], claudeMd: '' };

  for (const [path, entry] of Object.entries(zip.files)) {
    if (entry.dir) continue;
    const content = await entry.async('string');

    if (path.endsWith('CLAUDE.md') || path.includes('/CLAUDE.md')) {
      harness.claudeMd = content;
    } else if (path.includes('agents/') && path.endsWith('.md')) {
      const name = path.split('/').pop()?.replace('.md', '') ?? '';
      harness.agents.push({ label: name, name, description: content.slice(0, 200) });
    } else if (path.includes('skills/') && path.endsWith('.md')) {
      const name = path.split('/').pop()?.replace('.md', '') ?? '';
      harness.skills.push({ label: name, name, description: content.slice(0, 200) });
    } else if (path.includes('rules/') && path.endsWith('.md')) {
      const name = path.split('/').pop()?.replace('.md', '') ?? '';
      harness.rules.push({ label: name, name, content, description: content.slice(0, 200) });
    }
  }

  return harness;
}

export function AnalyzePage() {
  const navigate = useNavigate();
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [parsedFiles, setParsedFiles] = useState<ParsedHarness | null>(null);

  const handleFile = useCallback(async (file: File) => {
    setLoading(true);
    const parsed = await parseZip(file);
    setParsedFiles(parsed);
    const evaluation = await evaluateHarness({
      agents: parsed.agents,
      skills: parsed.skills,
      rules: parsed.rules,
      claudeMd: parsed.claudeMd,
      hooks: {},
      settings: {},
    });
    setResult(evaluation);
    setLoading(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.zip') || file.type === 'application/zip')) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const radarData = result
    ? Object.entries(result.scores).map(([axis, score]) => ({
        axis: AXIS_LABELS[axis] ?? axis,
        score: score.score,
      }))
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white px-8 py-6">
        <div className="mx-auto max-w-4xl">
          <button onClick={() => navigate('/')} className="mb-2 text-sm text-blue-600 hover:underline">&larr; Home</button>
          <h1 className="text-2xl font-bold text-gray-900">Analyze Harness</h1>
          <p className="mt-1 text-sm text-gray-500">기존 .claude/ 설정을 업로드하여 6축 프레임워크로 평가합니다.</p>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-8 py-8">
        {!result && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed p-16 transition ${
              dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
            }`}
          >
            {loading ? (
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            ) : (
              <>
                <div className="text-4xl">&#128230;</div>
                <p className="text-sm font-medium text-gray-700">Drag & drop .claude/ ZIP file</p>
                <p className="text-xs text-gray-400">or</p>
                <label className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                  Browse files
                  <input type="file" accept=".zip" onChange={handleFileInput} className="hidden" />
                </label>
              </>
            )}
          </div>
        )}
        {result && parsedFiles && (
          <div className="space-y-8">
            <div className="flex items-center gap-6 rounded-xl border bg-white p-6">
              <div className={`flex h-16 w-16 items-center justify-center rounded-xl text-2xl font-black ${GRADE_COLORS[result.grade]}`}>
                {result.grade}
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">{result.overall}<span className="text-lg text-gray-400">/100</span></div>
                <div className="mt-1 text-xs text-gray-500">
                  {parsedFiles.agents.length} agents, {parsedFiles.skills.length} skills, {parsedFiles.rules.length} rules
                </div>
              </div>
              <div className="ml-auto">
                <ResponsiveContainer width={200} height={160}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="axis" tick={{ fontSize: 9 }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="space-y-3">
              {Object.entries(result.scores).map(([axis, score]) => (
                <div key={axis} className="rounded-lg border bg-white p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{AXIS_LABELS[axis]}</span>
                    <span className="text-sm font-semibold">{score.score}/100</span>
                  </div>
                  {score.suggestions.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {score.suggestions.map((s, i) => (
                        <li key={i} className="text-xs text-gray-500">&#8226; {s}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={() => { setResult(null); setParsedFiles(null); }}
              className="w-full rounded-lg border py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              Analyze another
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
