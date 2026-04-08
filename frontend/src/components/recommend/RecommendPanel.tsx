import { useRecommendations } from '../../hooks/useRecommendations';
import { useCanvasContext } from '../../contexts/CanvasContext';
import { generateId } from '../../lib/id';
import type { RuleTemplate, SkillTemplate } from '../../api/recommendations';
import type { ForgeNode } from '../../types/node';

const CATEGORY_LABELS: Record<string, string> = {
  frontend: 'Frontend',
  backend: 'Backend',
  language: 'Language',
  infra: 'Infra',
};

const CATEGORY_COLORS: Record<string, string> = {
  frontend: 'bg-green-100 text-green-700 border-green-300',
  backend: 'bg-blue-100 text-blue-700 border-blue-300',
  language: 'bg-purple-100 text-purple-700 border-purple-300',
  infra: 'bg-orange-100 text-orange-700 border-orange-300',
};

interface RecommendPanelProps {
  onClose: () => void;
}

export function RecommendPanel({ onClose }: RecommendPanelProps) {
  const { stacks, selectedStackIds, toggleStack, recommendations, loading } = useRecommendations();
  const { setNodes } = useCanvasContext();

  const categories = [...new Set(stacks.map((s) => s.category))];

  const addRuleToCanvas = (rule: RuleTemplate) => {
    const node: ForgeNode = {
      id: generateId(),
      type: 'rule',
      position: { x: 300 + Math.random() * 200, y: 300 + Math.random() * 200 },
      data: {
        type: 'rule',
        label: rule.label,
        description: '',
        category: rule.category.split('/')[0],
        paths: rule.paths,
        content: rule.content,
      },
    };
    setNodes((nds) => [...nds, node]);
  };

  const addSkillToCanvas = (skill: SkillTemplate) => {
    const node: ForgeNode = {
      id: generateId(),
      type: 'skill',
      position: { x: 300 + Math.random() * 200, y: 300 + Math.random() * 200 },
      data: {
        type: 'skill',
        label: skill.name,
        description: skill.description,
        trigger: '',
        userInvocable: skill.userInvocable,
        args: '',
        instructions: skill.instructions,
      },
    };
    setNodes((nds) => [...nds, node]);
  };

  const addAllToCanvas = () => {
    if (!recommendations) return;
    const newNodes: ForgeNode[] = [];
    let y = 200;

    for (const rule of recommendations.rules) {
      newNodes.push({
        id: generateId(),
        type: 'rule',
        position: { x: 600, y },
        data: {
          type: 'rule',
          label: rule.label,
          description: '',
          category: rule.category.split('/')[0],
          paths: rule.paths,
          content: rule.content,
        },
      });
      y += 120;
    }

    for (const skill of recommendations.skills) {
      newNodes.push({
        id: generateId(),
        type: 'skill',
        position: { x: 300, y },
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
      y += 120;
    }

    setNodes((nds) => [...nds, ...newNodes]);
  };

  return (
    <aside className="flex w-96 shrink-0 flex-col border-l border-gray-200 bg-white">
      <div className="flex items-center justify-between bg-gray-900 px-4 py-2.5">
        <span className="text-sm font-semibold text-white">Tech Stack Recommendations</span>
        <button
          onClick={onClose}
          className="rounded p-0.5 text-white/80 hover:bg-white/20 hover:text-white"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Stack Selection */}
        <div className="border-b border-gray-200 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Select Stacks
          </p>
          {categories.map((cat) => (
            <div key={cat} className="mb-3">
              <p className="mb-1 text-xs font-medium text-gray-500">
                {CATEGORY_LABELS[cat] ?? cat}
              </p>
              <div className="flex flex-wrap gap-1">
                {stacks
                  .filter((s) => s.category === cat)
                  .map((stack) => {
                    const selected = selectedStackIds.includes(stack.id);
                    const colorClass = CATEGORY_COLORS[cat] ?? 'bg-gray-100 text-gray-700';
                    return (
                      <button
                        key={stack.id}
                        onClick={() => { toggleStack(stack.id); }}
                        className={`rounded-md border px-2 py-1 text-xs font-medium transition-all ${
                          selected
                            ? colorClass + ' border-current'
                            : 'border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100'
                        }`}
                      >
                        {stack.name}
                      </button>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>

        {/* Recommendations */}
        {loading && (
          <div className="p-4 text-center text-sm text-gray-400">Loading...</div>
        )}

        {recommendations && !loading && (
          <div className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Recommended ({recommendations.rules.length + recommendations.skills.length})
              </p>
              <button
                onClick={addAllToCanvas}
                className="rounded bg-gray-900 px-2 py-1 text-xs font-medium text-white hover:bg-gray-800"
              >
                Add All
              </button>
            </div>

            {recommendations.rules.length > 0 && (
              <div className="mb-4">
                <p className="mb-1 text-xs font-medium text-amber-600">Rules</p>
                <div className="flex flex-col gap-1.5">
                  {recommendations.rules.map((rule) => (
                    <div
                      key={rule.label}
                      className="flex items-center justify-between rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1.5"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-gray-800">{rule.label}</p>
                        <p className="truncate text-[10px] text-gray-500">{rule.category}</p>
                      </div>
                      <button
                        onClick={() => { addRuleToCanvas(rule); }}
                        className="ml-2 shrink-0 rounded bg-amber-500 px-2 py-0.5 text-[10px] font-medium text-white hover:bg-amber-600"
                      >
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {recommendations.skills.length > 0 && (
              <div>
                <p className="mb-1 text-xs font-medium text-green-600">Skills</p>
                <div className="flex flex-col gap-1.5">
                  {recommendations.skills.map((skill) => (
                    <div
                      key={skill.name}
                      className="flex items-center justify-between rounded-md border border-green-200 bg-green-50 px-2.5 py-1.5"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-gray-800">{skill.name}</p>
                        <p className="truncate text-[10px] text-gray-500">{skill.description}</p>
                      </div>
                      <button
                        onClick={() => { addSkillToCanvas(skill); }}
                        className="ml-2 shrink-0 rounded bg-green-500 px-2 py-0.5 text-[10px] font-medium text-white hover:bg-green-600"
                      >
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!recommendations && !loading && selectedStackIds.length === 0 && (
          <div className="p-4 text-center text-xs text-gray-400">
            기술 스택을 선택하면 규칙과 스킬을 추천합니다
          </div>
        )}
      </div>
    </aside>
  );
}
