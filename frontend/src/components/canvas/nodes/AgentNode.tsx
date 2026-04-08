import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { AgentNodeData, AgentModel } from '../../../types/node';

const MODEL_STYLES: Record<AgentModel, { bg: string; badge: string; border: string; ring: string }> = {
  opus:   { bg: 'bg-purple-500', badge: 'bg-purple-600', border: 'border-purple-300', ring: 'ring-purple-200' },
  sonnet: { bg: 'bg-blue-500',   badge: 'bg-blue-600',   border: 'border-blue-300',   ring: 'ring-blue-200' },
  haiku:  { bg: 'bg-teal-500',   badge: 'bg-teal-600',   border: 'border-teal-300',   ring: 'ring-teal-200' },
};

type AgentNodeProps = NodeProps & { data: AgentNodeData };

function AgentNodeComponent({ data, selected }: AgentNodeProps) {
  const style = MODEL_STYLES[data.model] ?? MODEL_STYLES.sonnet;
  const hasInstructions = Boolean(data.instructions);

  return (
    <div
      className={`w-56 rounded-lg border-2 bg-white shadow-md transition-shadow ${
        selected ? `border-current ${style.ring} ring-2` : style.border
      }`}
    >
      <Handle type="target" position={Position.Top} className={`!${style.bg}`} />

      <div className={`rounded-t-md ${style.bg} px-3 py-1.5`}>
        <div className="flex items-center gap-2">
          <span className="text-sm">🤖</span>
          <span className="text-sm font-semibold text-white">Agent</span>
          <span className={`ml-auto rounded ${style.badge} px-1.5 py-0.5 text-xs text-white/90`}>
            {data.model}
          </span>
        </div>
      </div>

      <div className="px-3 py-2">
        <p className="truncate text-sm font-medium text-gray-900">{data.label}</p>
        {data.description && (
          <p className="mt-0.5 truncate text-xs text-gray-500">{data.description}</p>
        )}
        {hasInstructions && (
          <div className="mt-1.5 flex items-center gap-1 text-xs text-gray-400">
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>instructions</span>
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className={`!${style.bg}`} />
    </div>
  );
}

export const AgentNode = memo(AgentNodeComponent);
