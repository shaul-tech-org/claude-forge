import { useCallback, useState, useEffect, useRef } from 'react';
import type { SkillNodeData } from '../../types/node';

interface SkillPropertyFormProps {
  data: SkillNodeData;
  onUpdate: (data: Partial<SkillNodeData>) => void;
}

export function SkillPropertyForm({ data, onUpdate }: SkillPropertyFormProps) {
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

  const userInvocable = data.userInvocable ?? true;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500">Name</label>
        <input
          type="text"
          value={data.label}
          onChange={(e) => onUpdate({ label: e.target.value })}
          className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500">Description</label>
        <input
          type="text"
          value={data.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="Skill의 역할을 간단히 설명"
          className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500">User Invocable</label>
        <div className="flex gap-1">
          <button
            onClick={() => onUpdate({ userInvocable: true })}
            className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
              userInvocable
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Yes
          </button>
          <button
            onClick={() => onUpdate({ userInvocable: false })}
            className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
              !userInvocable
                ? 'bg-gray-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            No
          </button>
        </div>
        <p className="mt-1 text-xs text-gray-400">
          {userInvocable ? '사용자가 /{name}으로 직접 호출 가능' : '조건에 의해 자동 실행'}
        </p>
      </div>

      {userInvocable && (
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Args</label>
          <input
            type="text"
            value={data.args ?? ''}
            onChange={(e) => onUpdate({ args: e.target.value })}
            placeholder='인자 설명 (예: FORGE-{번호})'
            className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
        </div>
      )}

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500">Trigger</label>
        <input
          type="text"
          value={data.trigger}
          onChange={(e) => onUpdate({ trigger: e.target.value })}
          placeholder="자동 실행 조건"
          className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
        />
      </div>

      <div className="flex flex-1 flex-col">
        <label className="mb-1 block text-xs font-medium text-gray-500">Instructions</label>
        <textarea
          value={instructions}
          onChange={(e) => onInstructionsChange(e.target.value)}
          placeholder="Skill의 실행 절차를 마크다운으로 작성..."
          className="min-h-[200px] flex-1 resize-y rounded-md border border-gray-300 px-3 py-2 font-mono text-xs leading-relaxed focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
        />
      </div>
    </div>
  );
}
