import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { MemoryNodeData } from '../../../types/node';

type MemoryNodeProps = NodeProps & { data: MemoryNodeData };

function MemoryNodeComponent({ data, selected }: MemoryNodeProps) {
  return (
    <div
      className={`w-56 rounded-lg border-2 bg-white shadow-md transition-shadow ${
        selected ? 'border-yellow-500 ring-2 ring-yellow-200' : 'border-yellow-300'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-yellow-500" />
      <div className="rounded-t-md bg-yellow-500 px-3 py-1.5">
        <div className="flex items-center gap-2">
          <span className="text-sm">&#128190;</span>
          <span className="text-sm font-semibold text-white">Memory</span>
          {data.memoryType && (
            <span className="ml-auto rounded bg-yellow-600 px-1.5 py-0.5 text-xs text-white/90">{data.memoryType}</span>
          )}
        </div>
      </div>
      <div className="px-3 py-2">
        <p className="truncate text-sm font-medium text-gray-900">{data.label}</p>
        {data.description && <p className="mt-0.5 truncate text-xs text-gray-500">{data.description}</p>}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-yellow-500" />
    </div>
  );
}

export const MemoryNode = memo(MemoryNodeComponent);
