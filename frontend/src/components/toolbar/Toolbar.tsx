import type { DragEvent } from 'react';
import { setDragData } from '../../hooks/useDragAndDrop';
import type { ForgeNodeType } from '../../types/node';
import { FolderPreview } from './FolderPreview';
import { ExportButton } from './ExportButton';

interface NodeButtonProps {
  nodeType: ForgeNodeType;
  label: string;
  icon: string;
  color: string;
}

function NodeButton({ nodeType, label, icon, color }: NodeButtonProps) {
  const onDragStart = (event: DragEvent) => {
    setDragData(event, nodeType);
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className={`flex cursor-grab items-center gap-2 rounded-lg border-2 ${color} bg-white px-3 py-2.5 transition-shadow hover:shadow-md active:cursor-grabbing`}
    >
      <span className="text-lg">{icon}</span>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </div>
  );
}

interface ToolbarProps {
  onOpenRecommend?: () => void;
}

export function Toolbar({ onOpenRecommend }: ToolbarProps) {
  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-4 py-3">
        <h1 className="text-lg font-bold text-gray-900">claude-forge</h1>
        <p className="text-xs text-gray-500">.claude config builder</p>
      </div>

      <div className="flex flex-col gap-2 p-4">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Nodes
        </p>
        <NodeButton
          nodeType="agent"
          label="Agent"
          icon="🤖"
          color="border-blue-300 hover:border-blue-400"
        />
        <NodeButton
          nodeType="skill"
          label="Skill"
          icon="⚡"
          color="border-green-300 hover:border-green-400"
        />
        <NodeButton
          nodeType="rule"
          label="Rule"
          icon="📏"
          color="border-amber-300 hover:border-amber-400"
        />
      </div>

      {onOpenRecommend && (
        <div className="px-4 pb-2">
          <button
            onClick={onOpenRecommend}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-gray-300 px-3 py-2 text-sm font-medium text-gray-500 transition-colors hover:border-gray-400 hover:text-gray-700"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Recommend
          </button>
        </div>
      )}

      <div className="mt-auto">
        <FolderPreview />
        <ExportButton />
      </div>
    </aside>
  );
}
