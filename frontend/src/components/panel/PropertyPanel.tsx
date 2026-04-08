import { useCanvasContext } from '../../contexts/CanvasContext';
import { AgentPropertyForm } from './AgentPropertyForm';
import { SkillPropertyForm } from './SkillPropertyForm';
import { RulePropertyForm } from './RulePropertyForm';
import type { AgentNodeData, SkillNodeData, RuleNodeData } from '../../types/node';

const NODE_TYPE_META = {
  agent: { icon: '🤖', label: 'Agent', color: 'bg-blue-500' },
  skill: { icon: '⚡', label: 'Skill', color: 'bg-green-500' },
  rule: { icon: '📏', label: 'Rule', color: 'bg-amber-500' },
} as const;

export function PropertyPanel() {
  const { selectedNode, selectNode, updateNodeData } = useCanvasContext();

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
          onClick={() => selectNode(null)}
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
            data={selectedNode.data as AgentNodeData}
            onUpdate={handleUpdate}
          />
        )}
        {nodeType === 'skill' && (
          <SkillPropertyForm
            data={selectedNode.data as SkillNodeData}
            onUpdate={handleUpdate}
          />
        )}
        {nodeType === 'rule' && (
          <RulePropertyForm
            data={selectedNode.data as RuleNodeData}
            onUpdate={handleUpdate}
          />
        )}
      </div>
    </aside>
  );
}
