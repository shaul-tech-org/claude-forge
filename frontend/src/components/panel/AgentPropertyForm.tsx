import { useCallback, useState, useEffect, useRef } from 'react';
import type { AgentNodeData, AgentModel } from '../../types/node';

const MODELS: { value: AgentModel; label: string; color: string }[] = [
  { value: 'opus', label: 'Opus', color: 'bg-purple-500' },
  { value: 'sonnet', label: 'Sonnet', color: 'bg-blue-500' },
  { value: 'haiku', label: 'Haiku', color: 'bg-teal-500' },
];

interface AgentPropertyFormProps {
  data: AgentNodeData;
  onUpdate: (data: Partial<AgentNodeData>) => void;
}

export function AgentPropertyForm({ data, onUpdate }: AgentPropertyFormProps) {
  const [instructions, setInstructions] = useState(data.instructions ?? '');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setInstructions(data.instructions ?? '');
  }, [data.instructions]);

  const onInstructionsChange = useCallback(
    (value: string) => {
      setInstructions(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onUpdate({ instructions: value });
      }, 300);
    },
    [onUpdate],
  );

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500">Name</label>
        <input
          type="text"
          value={data.label}
          onChange={(e) => onUpdate({ label: e.target.value })}
          className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500">Description</label>
        <input
          type="text"
          value={data.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="Agent의 역할을 간단히 설명"
          className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500">Model</label>
        <div className="flex gap-1">
          {MODELS.map((m) => (
            <button
              key={m.value}
              onClick={() => onUpdate({ model: m.value })}
              className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
                data.model === m.value
                  ? `${m.color} text-white`
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        <label className="mb-1 block text-xs font-medium text-gray-500">Instructions</label>
        <textarea
          value={instructions}
          onChange={(e) => onInstructionsChange(e.target.value)}
          placeholder="Agent의 역할, 규칙, 행동 지침을 마크다운으로 작성..."
          className="min-h-[200px] flex-1 resize-y rounded-md border border-gray-300 px-3 py-2 font-mono text-xs leading-relaxed focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}
