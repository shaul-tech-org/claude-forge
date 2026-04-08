import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface WizardState {
  // Step 1: Project Profile
  projectName: string;
  languages: string[];
  frameworks: string[];
  teamSize: number;
  // Step 2: Work Types
  workTypes: string[];
  // Step 3: Pattern
  selectedPattern: string | null;
  // Step 4: 6-Axis Design
  axisConfig: Record<string, string[]>;
  // Step 5: Budget confirmed
  budgetConfirmed: boolean;
}

const INITIAL_STATE: WizardState = {
  projectName: '',
  languages: [],
  frameworks: [],
  teamSize: 1,
  workTypes: [],
  selectedPattern: null,
  axisConfig: {
    context: [],
    verification: [],
    state: [],
    tools: [],
    human: [],
    lifecycle: [],
  },
  budgetConfirmed: false,
};

const LANGUAGE_OPTIONS = ['TypeScript', 'Python', 'PHP', 'Go', 'Rust', 'Java', 'Ruby', 'C#'];
const FRAMEWORK_OPTIONS = ['React', 'Next.js', 'Vue', 'Laravel', 'Django', 'FastAPI', 'Spring', 'Rails', 'Express'];
const WORK_TYPE_OPTIONS = [
  { id: 'coding', label: 'Coding', desc: '새 기능 구현, 버그 수정' },
  { id: 'review', label: 'Code Review', desc: '코드 리뷰, PR 검토' },
  { id: 'testing', label: 'Testing', desc: '테스트 작성 및 실행' },
  { id: 'refactoring', label: 'Refactoring', desc: '코드 구조 개선' },
  { id: 'docs', label: 'Documentation', desc: '문서 작성 및 관리' },
  { id: 'devops', label: 'DevOps', desc: 'CI/CD, 배포, 인프라' },
];

const PATTERN_OPTIONS = [
  { id: 'solo', name: 'Solo', desc: '에이전트 1개 + 스킬', teamFit: '1' },
  { id: 'pipeline', name: 'Pipeline', desc: '순차 처리 체인', teamFit: '1-3' },
  { id: 'fan-out-fan-in', name: 'Fan-out / Fan-in', desc: '병렬 분배 후 병합', teamFit: '3-8' },
  { id: 'expert-pool', name: 'Expert Pool', desc: '전문가 자동 위임', teamFit: '2-6' },
  { id: 'producer-reviewer', name: 'Producer-Reviewer', desc: '생성 + 리뷰 반복', teamFit: '1-3' },
  { id: 'supervisor', name: 'Supervisor', desc: '감독자 품질 관리', teamFit: '3-10' },
  { id: 'three-agent', name: '3-Agent', desc: 'Planner-Generator-Evaluator', teamFit: '1-3' },
];

const AXIS_OPTIONS: Record<string, Array<{ id: string; label: string }>> = {
  context: [
    { id: 'claude-md', label: 'CLAUDE.md 프로젝트 컨텍스트' },
    { id: 'rules', label: '코딩 규칙 (Rules)' },
    { id: 'agent-frontmatter', label: '에이전트 상세 instructions' },
    { id: 'imports', label: '@참조 외부 문서' },
  ],
  verification: [
    { id: 'test-skill', label: '테스트 실행 스킬' },
    { id: 'review-agent', label: '리뷰 에이전트' },
    { id: 'lint-rule', label: '린트/포맷 규칙' },
    { id: 'security-rule', label: '보안 규칙' },
  ],
  state: [
    { id: 'auto-memory', label: 'Auto Memory 활성화' },
    { id: 'agent-memory', label: 'Agent Memory 사용' },
    { id: 'claude-md-update', label: 'CLAUDE.md 자동 업데이트' },
  ],
  tools: [
    { id: 'skills', label: '사용자 호출 스킬' },
    { id: 'mcp-servers', label: 'MCP 서버 연결' },
    { id: 'custom-commands', label: '커스텀 명령어' },
  ],
  human: [
    { id: 'permission-mode', label: '권한 모드 설정' },
    { id: 'dangerous-block', label: '위험 명령 차단' },
    { id: 'approval-gate', label: '승인 게이트' },
  ],
  lifecycle: [
    { id: 'pre-tool-hook', label: 'PreToolUse 훅' },
    { id: 'post-tool-hook', label: 'PostToolUse 훅' },
    { id: 'notification-hook', label: 'Notification 훅' },
    { id: 'format-hook', label: '자동 포맷 훅' },
  ],
};

const AXIS_LABELS: Record<string, string> = {
  context: 'Context Engineering',
  verification: 'Verification Loops',
  state: 'State Management',
  tools: 'Tool Orchestration',
  human: 'Human-in-the-Loop',
  lifecycle: 'Lifecycle Management',
};

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-2 flex-1 rounded-full transition ${i < current ? 'bg-blue-600' : i === current ? 'bg-blue-400' : 'bg-gray-200'}`}
        />
      ))}
    </div>
  );
}

function ToggleChip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
        selected ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:ring-blue-300'
      }`}
    >
      {label}
    </button>
  );
}

export function CreatePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [state, setState] = useState<WizardState>(INITIAL_STATE);

  const toggleArray = (field: keyof WizardState, value: string) => {
    setState((prev) => {
      const arr = prev[field] as string[];
      return { ...prev, [field]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value] };
    });
  };

  const toggleAxisOption = (axis: string, optionId: string) => {
    setState((prev) => {
      const current = prev.axisConfig[axis] ?? [];
      const updated = current.includes(optionId)
        ? current.filter((v) => v !== optionId)
        : [...current, optionId];
      return { ...prev, axisConfig: { ...prev.axisConfig, [axis]: updated } };
    });
  };

  const canNext = (): boolean => {
    switch (step) {
      case 0: return state.projectName.trim().length > 0;
      case 1: return state.workTypes.length > 0;
      case 2: return state.selectedPattern !== null;
      case 3: return true;
      case 4: return true;
      default: return false;
    }
  };

  const handleFinish = () => {
    // Store wizard state and navigate to builder
    localStorage.setItem('claude-forge-wizard-result', JSON.stringify(state));
    navigate('/create/builder');
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="border-b bg-white px-8 py-4">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <button onClick={() => navigate('/')} className="text-sm text-blue-600 hover:underline">&larr; Home</button>
          <span className="text-sm text-gray-400">Step {step + 1} / 5</span>
        </div>
      </header>
      <main className="mx-auto w-full max-w-2xl flex-1 px-8 py-8">
        <StepIndicator current={step} total={5} />
        <div className="mt-8">
          {step === 0 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900">Project Profile</h2>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Project Name</label>
                <input
                  type="text"
                  value={state.projectName}
                  onChange={(e) => setState({ ...state, projectName: e.target.value })}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  placeholder="my-awesome-project"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Languages</label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGE_OPTIONS.map((lang) => (
                    <ToggleChip key={lang} label={lang} selected={state.languages.includes(lang)} onClick={() => toggleArray('languages', lang)} />
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Frameworks</label>
                <div className="flex flex-wrap gap-2">
                  {FRAMEWORK_OPTIONS.map((fw) => (
                    <ToggleChip key={fw} label={fw} selected={state.frameworks.includes(fw)} onClick={() => toggleArray('frameworks', fw)} />
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Team Size</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={state.teamSize}
                  onChange={(e) => setState({ ...state, teamSize: parseInt(e.target.value) || 1 })}
                  className="w-24 rounded-lg border px-3 py-2 text-sm"
                />
              </div>
            </div>
          )}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900">Work Types</h2>
              <p className="text-sm text-gray-500">이 프로젝트에서 주로 수행하는 작업 유형을 선택하세요.</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {WORK_TYPE_OPTIONS.map((wt) => (
                  <button
                    key={wt.id}
                    onClick={() => toggleArray('workTypes', wt.id)}
                    className={`rounded-xl border-2 p-4 text-left transition ${
                      state.workTypes.includes(wt.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-200'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{wt.label}</div>
                    <div className="mt-0.5 text-xs text-gray-500">{wt.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900">Architecture Pattern</h2>
              <p className="text-sm text-gray-500">프로젝트에 적합한 아키텍처 패턴을 선택하세요.</p>
              <div className="space-y-3">
                {PATTERN_OPTIONS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setState({ ...state, selectedPattern: p.id })}
                    className={`flex w-full items-center justify-between rounded-xl border-2 p-4 text-left transition ${
                      state.selectedPattern === p.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-200'
                    }`}
                  >
                    <div>
                      <div className="font-medium text-gray-900">{p.name}</div>
                      <div className="mt-0.5 text-xs text-gray-500">{p.desc}</div>
                    </div>
                    <span className="text-xs text-gray-400">Team: {p.teamFit}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900">6-Axis Design</h2>
              <p className="text-sm text-gray-500">각 축에서 필요한 구성 요소를 선택하세요.</p>
              {Object.entries(AXIS_OPTIONS).map(([axis, options]) => (
                <div key={axis} className="rounded-xl border bg-white p-4">
                  <h3 className="mb-3 font-medium text-gray-900">{AXIS_LABELS[axis]}</h3>
                  <div className="flex flex-wrap gap-2">
                    {options.map((opt) => (
                      <ToggleChip
                        key={opt.id}
                        label={opt.label}
                        selected={(state.axisConfig[axis] ?? []).includes(opt.id)}
                        onClick={() => toggleAxisOption(axis, opt.id)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900">Review & Build</h2>
              <div className="space-y-3 rounded-xl border bg-white p-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Project</span>
                  <span className="font-medium">{state.projectName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Languages</span>
                  <span className="font-medium">{state.languages.join(', ') || '-'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Frameworks</span>
                  <span className="font-medium">{state.frameworks.join(', ') || '-'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Team Size</span>
                  <span className="font-medium">{state.teamSize}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Pattern</span>
                  <span className="font-medium">{state.selectedPattern}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Work Types</span>
                  <span className="font-medium">{state.workTypes.join(', ')}</span>
                </div>
              </div>
              <p className="text-center text-sm text-gray-500">Canvas Builder에서 세부 구성을 편집할 수 있습니다.</p>
            </div>
          )}
        </div>
        <div className="mt-8 flex justify-between">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 disabled:opacity-30"
          >
            Back
          </button>
          {step < 4 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canNext()}
              className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Build in Canvas
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
