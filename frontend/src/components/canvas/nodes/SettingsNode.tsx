import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { SettingsNodeData } from '../../../types/node';

type SettingsNodeProps = NodeProps & { data: SettingsNodeData };

function SettingsNodeComponent({ data, selected }: SettingsNodeProps) {
  return (
    <div
      className={`w-56 rounded-lg border-2 bg-white shadow-md transition-shadow ${
        selected ? 'border-gray-800 ring-2 ring-gray-300' : 'border-gray-400'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-gray-700" />
      <div className="rounded-t-md bg-gray-700 px-3 py-1.5">
        <div className="flex items-center gap-2">
          <span className="text-sm">&#9881;</span>
          <span className="text-sm font-semibold text-white">Settings</span>
        </div>
      </div>
      <div className="px-3 py-2">
        <p className="truncate text-sm font-medium text-gray-900">{data.label}</p>
        {data.description && <p className="mt-0.5 truncate text-xs text-gray-500">{data.description}</p>}
        {data.key && (
          <div className="mt-1 rounded bg-gray-50 px-2 py-1 font-mono text-[10px] text-gray-600">
            {data.key}: {data.value ?? '...'}
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-gray-700" />
    </div>
  );
}

export const SettingsNode = memo(SettingsNodeComponent);
