import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { SkillNodeData } from '../../../types/node';

type SkillNodeProps = NodeProps & { data: SkillNodeData };

function SkillNodeComponent({ data, selected }: SkillNodeProps) {
  const userInvocable = data.userInvocable ?? true;
  const hasInstructions = Boolean(data.instructions);

  return (
    <div
      className={`w-56 rounded-lg border-2 bg-white shadow-md transition-shadow ${
        selected ? 'border-green-500 ring-2 ring-green-200' : 'border-green-300'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-green-500" />

      <div className="rounded-t-md bg-green-500 px-3 py-1.5">
        <div className="flex items-center gap-2">
          <span className="text-sm">⚡</span>
          <span className="text-sm font-semibold text-white">Skill</span>
          {userInvocable && (
            <span className="ml-auto rounded bg-green-600 px-1.5 py-0.5 text-xs text-green-100">
              /{data.label.toLowerCase().replace(/\s+/g, '-')}
            </span>
          )}
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

      <Handle type="source" position={Position.Bottom} className="!bg-green-500" />
    </div>
  );
}

export const SkillNode = memo(SkillNodeComponent);
