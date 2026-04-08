import { useMemo, useState } from 'react';
import { useCanvasContext } from '../../contexts/CanvasContext';
import { AgentPropertyForm } from './AgentPropertyForm';
import { SkillPropertyForm } from './SkillPropertyForm';
import { RulePropertyForm } from './RulePropertyForm';
import { extractKeywords } from '../../lib/keywords';

const NODE_TYPE_META: Record<string, { icon: string; label: string; color: string; axis: string; hint: string }> = {
  agent: { icon: '🤖', label: 'Agent', color: 'bg-blue-500', axis: 'Tool Orchestration', hint: '에이전트의 역할과 전문 영역을 명확히 정의하세요.' },
  skill: { icon: '⚡', label: 'Skill', color: 'bg-green-500', axis: 'Tool Orchestration', hint: '스킬은 사용자가 직접 호출할 수 있는 재사용 가능한 도구입니다.' },
  rule: { icon: '📏', label: 'Rule', color: 'bg-amber-500', axis: 'Context Engineering', hint: '규칙은 코드 품질과 일관성을 유지하는 가드레일입니다.' },
  hook: { icon: '⚡', label: 'Hook', color: 'bg-orange-500', axis: 'Lifecycle Management', hint: '훅은 도구 실행 전후에 자동으로 동작하는 이벤트 핸들러입니다.' },
  mcp: { icon: '🔌', label: 'MCP Server', color: 'bg-red-500', axis: 'Tool Orchestration', hint: 'MCP 서버는 외부 도구와 데이터 소스를 연결합니다.' },
  memory: { icon: '💾', label: 'Memory', color: 'bg-yellow-500', axis: 'State Management', hint: '메모리는 세션 간 학습과 기억을 관리합니다.' },
  permission: { icon: '🔒', label: 'Permission', color: 'bg-gray-500', axis: 'Human-in-the-Loop', hint: '권한 설정은 위험한 작업에 대한 사람의 개입을 관리합니다.' },
  settings: { icon: '⚙', label: 'Settings', color: 'bg-gray-700', axis: 'Context Engineering', hint: 'settings.json의 개별 설정을 관리합니다.' },
};

function GuideForm({ data, onUpdate }: { data: Record<string, unknown>; onUpdate: (d: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500">Name</label>
        <input
          type="text"
          value={(data.label as string) ?? ''}
          onChange={(e) => onUpdate({ label: e.target.value })}
          className="w-full rounded-lg border px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500">Description</label>
        <textarea
          value={(data.description as string) ?? ''}
          onChange={(e) => onUpdate({ description: e.target.value })}
          rows={3}
          className="w-full rounded-lg border px-3 py-2 text-sm"
        />
      </div>
    </div>
  );
}

export function PropertyPanel() {
  const { selectedNode, selectNode, updateNodeData } = useCanvasContext();
  const [keywordsOpen, setKeywordsOpen] = useState(false);

  const keywords = useMemo(
    () => (selectedNode ? extractKeywords(selectedNode.data) : []),
    [selectedNode],
  );

  if (!selectedNode) return null;

  const nodeType = selectedNode.data.type as string;
  const meta = NODE_TYPE_META[nodeType] ?? { icon: '?', label: nodeType, color: 'bg-gray-500', axis: '', hint: '' };

  const handleUpdate = (data: Record<string, unknown>) => {
    updateNodeData(selectedNode.id, data);
  };

  const hasSpecializedForm = ['agent', 'skill', 'rule'].includes(nodeType);

  return (
    <aside className="flex w-80 shrink-0 flex-col border-l border-gray-200 bg-white">
      <div className={`flex items-center justify-between ${meta.color} px-4 py-2.5`}>
        <div className="flex items-center gap-2">
          <span>{meta.icon}</span>
          <span className="text-sm font-semibold text-white">{meta.label}</span>
        </div>
        <button
          onClick={() => { selectNode(null); }}
          className="rounded p-0.5 text-white/80 hover:bg-white/20 hover:text-white"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {meta.hint && (
        <div className="border-b bg-blue-50 px-4 py-2">
          <div className="flex items-start gap-1.5">
            <span className="mt-0.5 text-xs text-blue-400">&#9432;</span>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wide text-blue-500">{meta.axis}</div>
              <p className="mt-0.5 text-xs leading-relaxed text-blue-600">{meta.hint}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4">
        {nodeType === 'agent' && (
          <AgentPropertyForm data={selectedNode.data} onUpdate={handleUpdate} />
        )}
        {nodeType === 'skill' && (
          <SkillPropertyForm data={selectedNode.data} onUpdate={handleUpdate} />
        )}
        {nodeType === 'rule' && (
          <RulePropertyForm data={selectedNode.data} onUpdate={handleUpdate} />
        )}
        {!hasSpecializedForm && (
          <GuideForm data={selectedNode.data as Record<string, unknown>} onUpdate={handleUpdate} />
        )}
      </div>

      {keywords.length > 0 && (
        <div className="border-t border-gray-200">
          <button
            onClick={() => { setKeywordsOpen(!keywordsOpen); }}
            className="flex w-full items-center justify-between px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-400 hover:bg-gray-50"
          >
            <span>Keywords ({keywords.length})</span>
            <svg
              className={`h-3.5 w-3.5 transition-transform ${keywordsOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          {keywordsOpen && (
            <div className="px-4 pb-3">
              <div className="flex flex-wrap gap-1">
                {keywords.map((kw) => (
                  <span
                    key={kw.keyword}
                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${kw.color}`}
                  >
                    {kw.keyword}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
