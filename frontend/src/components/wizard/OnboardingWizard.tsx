import { useState, useCallback } from 'react';
import { useCanvasContext } from '../../contexts/CanvasContext';
import { useRecommendations } from '../../hooks/useRecommendations';
import { generateId } from '../../lib/id';
import { exportToZip, downloadBlob } from '../../lib/export';
import type { ForgeNode, AgentModel } from '../../types/node';

const STEPS = [
  { id: 'welcome', title: 'Welcome', desc: 'claude-forge에 오신 것을 환영합니다' },
  { id: 'stacks', title: 'Tech Stacks', desc: '프로젝트의 기술 스택을 선택하세요' },
  { id: 'agents', title: 'Agents', desc: '작업을 수행할 에이전트를 정의하세요' },
  { id: 'connect', title: 'Connect', desc: '규칙과 스킬을 에이전트에 연결하세요' },
  { id: 'export', title: 'Export', desc: '설정을 내보내세요' },
] as const;

type StepId = (typeof STEPS)[number]['id'];

const CATEGORY_COLORS: Record<string, string> = {
  frontend: 'bg-green-100 text-green-700',
  backend: 'bg-blue-100 text-blue-700',
  language: 'bg-purple-100 text-purple-700',
  infra: 'bg-orange-100 text-orange-700',
};

interface AgentDraft {
  id: string;
  name: string;
  description: string;
  model: AgentModel;
  instructions: string;
}

interface OnboardingWizardProps {
  onClose: () => void;
}

export function OnboardingWizard({ onClose }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState<StepId>('welcome');
  const { setNodes, nodes } = useCanvasContext();
  const { stacks, selectedStackIds, toggleStack, recommendations, loading } = useRecommendations();
  const [agentDrafts, setAgentDrafts] = useState<AgentDraft[]>([
    { id: generateId(), name: '', description: '', model: 'sonnet', instructions: '' },
  ]);
  const [exporting, setExporting] = useState(false);

  const stepIndex = STEPS.findIndex((s) => s.id === currentStep);
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === STEPS.length - 1;

  const next = () => {
    if (stepIndex < STEPS.length - 1) {
      const nextStep = STEPS[stepIndex + 1].id;

      // Step 2→3 전환 시: 추천 규칙/스킬 캔버스에 추가
      if (currentStep === 'stacks' && recommendations) {
        applyRecommendations();
      }

      // Step 3→4 전환 시: Agent 캔버스에 추가
      if (currentStep === 'agents') {
        applyAgents();
      }

      setCurrentStep(nextStep);
    }
  };

  const prev = () => {
    if (stepIndex > 0) setCurrentStep(STEPS[stepIndex - 1].id);
  };

  const applyRecommendations = useCallback(() => {
    if (!recommendations) return;
    const newNodes: ForgeNode[] = [];
    let y = 300;

    for (const rule of recommendations.rules) {
      newNodes.push({
        id: generateId(),
        type: 'rule',
        position: { x: 500 + Math.random() * 100, y },
        data: {
          type: 'rule',
          label: rule.label,
          description: '',
          category: rule.category.split('/')[0],
          paths: rule.paths,
          content: rule.content,
        },
      });
      y += 110;
    }

    for (const skill of recommendations.skills) {
      newNodes.push({
        id: generateId(),
        type: 'skill',
        position: { x: 200 + Math.random() * 100, y },
        data: {
          type: 'skill',
          label: skill.name,
          description: skill.description,
          trigger: '',
          userInvocable: skill.userInvocable,
          args: '',
          instructions: skill.instructions,
        },
      });
      y += 110;
    }

    setNodes((nds) => [...nds, ...newNodes]);
  }, [recommendations, setNodes]);

  const applyAgents = useCallback(() => {
    const validDrafts = agentDrafts.filter((d) => d.name.trim());
    if (validDrafts.length === 0) return;

    const newNodes: ForgeNode[] = [];
    const startX = 100;
    let x = startX;

    for (const draft of validDrafts) {
      newNodes.push({
        id: draft.id,
        type: 'agent',
        position: { x, y: 80 },
        data: {
          type: 'agent',
          label: draft.name,
          description: draft.description,
          model: draft.model,
          instructions: draft.instructions,
        },
      });
      x += 250;
    }

    setNodes((nds) => [...nds, ...newNodes]);
  }, [agentDrafts, setNodes]);

  const addAgentDraft = () => {
    setAgentDrafts((prev) => [
      ...prev,
      { id: generateId(), name: '', description: '', model: 'sonnet', instructions: '' },
    ]);
  };

  const updateAgentDraft = (id: string, field: keyof AgentDraft, value: string) => {
    setAgentDrafts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, [field]: value } : d)),
    );
  };

  const removeAgentDraft = (id: string) => {
    setAgentDrafts((prev) => prev.filter((d) => d.id !== id));
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await exportToZip(nodes);
      downloadBlob(blob, 'claude-config.zip');
    } finally {
      setExporting(false);
    }
  };

  const categories = [...new Set(stacks.map((s) => s.category))];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="mx-4 flex h-[600px] w-full max-w-2xl flex-col rounded-xl bg-white shadow-2xl">
        {/* Progress bar */}
        <div className="flex items-center gap-1 border-b border-gray-200 px-6 py-3">
          {STEPS.map((step, i) => (
            <div key={step.id} className="flex flex-1 items-center">
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  i < stepIndex
                    ? 'bg-green-500 text-white'
                    : i === stepIndex
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-200 text-gray-500'
                }`}
              >
                {i < stepIndex ? '✓' : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`mx-1 h-0.5 flex-1 ${i < stepIndex ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step header */}
        <div className="px-6 pt-4 pb-2">
          <h2 className="text-lg font-bold text-gray-900">{STEPS[stepIndex].title}</h2>
          <p className="text-sm text-gray-500">{STEPS[stepIndex].desc}</p>
        </div>

        {/* Step content */}
        <div className="flex-1 overflow-y-auto px-6 py-2">
          {/* Welcome */}
          {currentStep === 'welcome' && (
            <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
              <div className="text-5xl">🔨</div>
              <h3 className="text-xl font-bold text-gray-900">claude-forge</h3>
              <p className="max-w-md text-sm text-gray-600">
                Claude Code의 .claude 설정을 드래그 앤 드롭으로 생성하고 최적화하는 빌더입니다.
                5단계로 프로젝트에 맞는 Agent, Rule, Skill 설정을 만들어 보세요.
              </p>
              <div className="mt-4 flex gap-6 text-center">
                <div>
                  <div className="text-2xl">🤖</div>
                  <p className="mt-1 text-xs font-medium text-gray-700">Agent</p>
                  <p className="text-[10px] text-gray-400">작업 수행자</p>
                </div>
                <div>
                  <div className="text-2xl">📏</div>
                  <p className="mt-1 text-xs font-medium text-gray-700">Rule</p>
                  <p className="text-[10px] text-gray-400">코딩 규칙</p>
                </div>
                <div>
                  <div className="text-2xl">⚡</div>
                  <p className="mt-1 text-xs font-medium text-gray-700">Skill</p>
                  <p className="text-[10px] text-gray-400">자동화 명령</p>
                </div>
              </div>
            </div>
          )}

          {/* Stacks */}
          {currentStep === 'stacks' && (
            <div className="flex flex-col gap-4">
              {categories.map((cat) => (
                <div key={cat}>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
                    {cat}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {stacks
                      .filter((s) => s.category === cat)
                      .map((stack) => {
                        const selected = selectedStackIds.includes(stack.id);
                        return (
                          <button
                            key={stack.id}
                            onClick={() => { toggleStack(stack.id); }}
                            className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-all ${
                              selected
                                ? (CATEGORY_COLORS[cat] ?? 'bg-gray-100 text-gray-700') + ' border-current'
                                : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {stack.name}
                          </button>
                        );
                      })}
                  </div>
                </div>
              ))}
              {loading && <p className="text-sm text-gray-400">추천 로딩 중...</p>}
              {recommendations && !loading && (
                <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-600">
                  {recommendations.rules.length} Rules + {recommendations.skills.length} Skills 추천됨
                </div>
              )}
            </div>
          )}

          {/* Agents */}
          {currentStep === 'agents' && (
            <div className="flex flex-col gap-3">
              {agentDrafts.map((draft, i) => (
                <div key={draft.id} className="rounded-lg border border-gray-200 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-blue-500">Agent {i + 1}</span>
                    {agentDrafts.length > 1 && (
                      <button
                        onClick={() => { removeAgentDraft(draft.id); }}
                        className="text-xs text-gray-400 hover:text-red-500"
                      >
                        삭제
                      </button>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <input
                      placeholder="이름 (예: coordinator)"
                      value={draft.name}
                      onChange={(e) => { updateAgentDraft(draft.id, 'name', e.target.value); }}
                      className="rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <input
                      placeholder="설명 (예: 요청 분석 + 라우팅)"
                      value={draft.description}
                      onChange={(e) => { updateAgentDraft(draft.id, 'description', e.target.value); }}
                      className="rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <div className="flex gap-1">
                      {(['opus', 'sonnet', 'haiku'] as const).map((m) => (
                        <button
                          key={m}
                          onClick={() => { updateAgentDraft(draft.id, 'model', m); }}
                          className={`flex-1 rounded-md px-2 py-1 text-xs font-medium ${
                            draft.model === m
                              ? m === 'opus' ? 'bg-purple-500 text-white'
                              : m === 'haiku' ? 'bg-teal-500 text-white'
                              : 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              <button
                onClick={addAgentDraft}
                className="rounded-lg border-2 border-dashed border-gray-300 py-2 text-sm text-gray-500 hover:border-gray-400 hover:text-gray-700"
              >
                + Agent 추가
              </button>
            </div>
          )}

          {/* Connect */}
          {currentStep === 'connect' && (
            <div className="flex flex-col gap-4 py-2">
              <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-700">
                <p className="font-medium">캔버스에서 연결하세요</p>
                <p className="mt-1 text-xs text-blue-600">
                  위자드를 닫으면 캔버스에 Agent, Rule, Skill 노드가 배치되어 있습니다.
                  Agent 하단 핸들에서 드래그하여 Rule/Skill에 연결하세요.
                </p>
              </div>
              <div className="flex flex-col gap-2 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-0.5 w-8 bg-green-500" />
                  <span>Agent → Skill = <strong>uses</strong> (사용)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block h-0.5 w-8 bg-amber-500" />
                  <span>Agent → Rule = <strong>applies</strong> (적용)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block h-1 w-8 bg-gray-500" />
                  <span>Agent → Agent = <strong>delegates</strong> (위임)</span>
                </div>
              </div>
              <div className="mt-2 rounded-lg bg-gray-50 p-3 text-xs text-gray-500">
                현재 캔버스: {nodes.filter(n => n.type === 'agent').length} Agents,{' '}
                {nodes.filter(n => n.type === 'rule').length} Rules,{' '}
                {nodes.filter(n => n.type === 'skill').length} Skills
              </div>
            </div>
          )}

          {/* Export */}
          {currentStep === 'export' && (
            <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
              <div className="text-5xl">🎉</div>
              <h3 className="text-lg font-bold text-gray-900">설정이 준비되었습니다!</h3>
              <p className="max-w-md text-sm text-gray-600">
                캔버스에서 노드를 연결한 후 ZIP으로 내보내거나,
                왼쪽 Preview에서 개별 파일을 복사할 수 있습니다.
              </p>
              <div className="mt-2 rounded-lg bg-gray-50 px-6 py-3 text-sm text-gray-700">
                {nodes.filter(n => n.type === 'agent').length} Agents ·{' '}
                {nodes.filter(n => n.type === 'rule').length} Rules ·{' '}
                {nodes.filter(n => n.type === 'skill').length} Skills
              </div>
              <button
                onClick={() => { void handleExport(); }}
                disabled={nodes.length === 0 || exporting}
                className="mt-2 rounded-lg bg-gray-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:bg-gray-300"
              >
                {exporting ? 'Exporting...' : 'Export ZIP'}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-200 px-6 py-3">
          <button
            onClick={onClose}
            className="text-sm text-gray-400 hover:text-gray-600"
          >
            건너뛰기
          </button>
          <div className="flex gap-2">
            {!isFirst && (
              <button
                onClick={prev}
                className="rounded-lg border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                이전
              </button>
            )}
            {!isLast ? (
              <button
                onClick={next}
                className="rounded-lg bg-gray-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-gray-800"
              >
                다음
              </button>
            ) : (
              <button
                onClick={onClose}
                className="rounded-lg bg-gray-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-gray-800"
              >
                캔버스로 이동
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
