import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { McpNodeData } from '../../../types/node';

type McpNodeProps = NodeProps & { data: McpNodeData };

function McpServerNodeComponent({ data, selected }: McpNodeProps) {
  return (
    <div
      className={`w-56 rounded-lg border-2 bg-white shadow-md transition-shadow ${
        selected ? 'border-red-500 ring-2 ring-red-200' : 'border-red-300'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-red-500" />
      <div className="rounded-t-md bg-red-500 px-3 py-1.5">
        <div className="flex items-center gap-2">
          <span className="text-sm">&#128268;</span>
          <span className="text-sm font-semibold text-white">MCP Server</span>
        </div>
      </div>
      <div className="px-3 py-2">
        <p className="truncate text-sm font-medium text-gray-900">{data.label}</p>
        {data.description && <p className="mt-0.5 truncate text-xs text-gray-500">{data.description}</p>}
        {data.tools && data.tools.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {data.tools.slice(0, 3).map((tool) => (
              <span key={tool} className="rounded bg-red-50 px-1 py-0.5 text-[10px] text-red-600">{tool}</span>
            ))}
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-red-500" />
    </div>
  );
}

export const McpServerNode = memo(McpServerNodeComponent);
