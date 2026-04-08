import { useCallback, useState, useEffect, useRef } from 'react';
import type { RuleNodeData } from '../../types/node';

const CATEGORIES = ['common', 'backend', 'frontend', 'infra', 'governance'] as const;

interface RulePropertyFormProps {
  data: RuleNodeData;
  onUpdate: (data: Partial<RuleNodeData>) => void;
}

export function RulePropertyForm({ data, onUpdate }: RulePropertyFormProps) {
  const [content, setContent] = useState(data.content ?? '');
  const [pathInput, setPathInput] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setContent(data.content ?? '');
  }, [data.content]);

  const onContentChange = useCallback(
    (value: string) => {
      setContent(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onUpdate({ content: value });
      }, 300);
    },
    [onUpdate],
  );

  const addPath = useCallback(() => {
    const trimmed = pathInput.trim();
    if (!trimmed) return;
    const currentPaths = data.paths ?? [];
    if (!currentPaths.includes(trimmed)) {
      onUpdate({ paths: [...currentPaths, trimmed] });
    }
    setPathInput('');
  }, [pathInput, data.paths, onUpdate]);

  const removePath = useCallback(
    (index: number) => {
      const currentPaths = data.paths ?? [];
      onUpdate({ paths: currentPaths.filter((_, i) => i !== index) });
    },
    [data.paths, onUpdate],
  );

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500">Name</label>
        <input
          type="text"
          value={data.label}
          onChange={(e) => onUpdate({ label: e.target.value })}
          className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500">Description</label>
        <input
          type="text"
          value={data.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="Rule의 목적을 간단히 설명"
          className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500">Category</label>
        <div className="flex flex-wrap gap-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => onUpdate({ category: cat })}
              className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                data.category === cat
                  ? 'bg-amber-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500">
          Paths <span className="text-gray-400">(glob patterns)</span>
        </label>
        <div className="flex gap-1">
          <input
            type="text"
            value={pathInput}
            onChange={(e) => setPathInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addPath()}
            placeholder="**/*.php"
            className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
          <button
            onClick={addPath}
            className="rounded-md bg-amber-500 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-amber-600"
          >
            +
          </button>
        </div>
        {(data.paths ?? []).length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {(data.paths ?? []).map((path, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 font-mono text-xs text-amber-700"
              >
                {path}
                <button
                  onClick={() => removePath(i)}
                  className="text-amber-400 hover:text-amber-600"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col">
        <label className="mb-1 block text-xs font-medium text-gray-500">Content</label>
        <textarea
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          placeholder="Rule의 내용을 마크다운으로 작성..."
          className="min-h-[200px] flex-1 resize-y rounded-md border border-gray-300 px-3 py-2 font-mono text-xs leading-relaxed focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
      </div>
    </div>
  );
}
