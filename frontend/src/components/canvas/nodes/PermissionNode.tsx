import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { PermissionNodeData } from '../../../types/node';

type PermissionNodeProps = NodeProps & { data: PermissionNodeData };

function PermissionNodeComponent({ data, selected }: PermissionNodeProps) {
  return (
    <div
      className={`w-56 rounded-lg border-2 bg-white shadow-md transition-shadow ${
        selected ? 'border-gray-500 ring-2 ring-gray-200' : 'border-gray-300'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-gray-500" />
      <div className="rounded-t-md bg-gray-500 px-3 py-1.5">
        <div className="flex items-center gap-2">
          <span className="text-sm">&#128274;</span>
          <span className="text-sm font-semibold text-white">Permission</span>
          {data.mode && (
            <span className="ml-auto rounded bg-gray-600 px-1.5 py-0.5 text-xs text-white/90">{data.mode}</span>
          )}
        </div>
      </div>
      <div className="px-3 py-2">
        <p className="truncate text-sm font-medium text-gray-900">{data.label}</p>
        {data.description && <p className="mt-0.5 truncate text-xs text-gray-500">{data.description}</p>}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-gray-500" />
    </div>
  );
}

export const PermissionNode = memo(PermissionNodeComponent);
