import { useMemo, useState } from 'react';
import { useCanvasContext } from '../../contexts/CanvasContext';
import { AgentPropertyForm } from './AgentPropertyForm';
import { SkillPropertyForm } from './SkillPropertyForm';
import { RulePropertyForm } from './RulePropertyForm';
import { extractKeywords } from '../../lib/keywords';

const NODE_TYPE_META = {
  agent: { icon: '🤖', label: 'Agent', color: 'bg-blue-500' },
  skill: { icon: '⚡', label: 'Skill', color: 'bg-green-500' },
  rule: { icon: '📏', label: 'Rule', color: 'bg-amber-500' },
} as const;

export function PropertyPanel() {
  const { selectedNode, selectNode, updateNodeData } = useCanvasContext();
  const [keywordsOpen, setKeywordsOpen] = useState(false);

  const keywords = useMemo(
    () => (selectedNode ? extractKeywords(selectedNode.data) : []),
    [selectedNode],
  );

  if (!selectedNode) return null;

  const nodeType = selectedNode.data.type;
  const meta = NODE_TYPE_META[nodeType];

  const handleUpdate = (data: Record<string, unknown>) => {
    updateNodeData(selectedNode.id, data);
  };

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

      <div className="flex-1 overflow-y-auto p-4">
        {nodeType === 'agent' && (
          <AgentPropertyForm
            data={selectedNode.data}
            onUpdate={handleUpdate}
          />
        )}
        {nodeType === 'skill' && (
          <SkillPropertyForm
            data={selectedNode.data}
            onUpdate={handleUpdate}
          />
        )}
        {nodeType === 'rule' && (
          <RulePropertyForm
            data={selectedNode.data}
            onUpdate={handleUpdate}
          />
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
