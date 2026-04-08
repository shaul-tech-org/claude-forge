import { useState, useCallback } from 'react';
import { useCanvasContext } from '../../contexts/CanvasContext';
import type { HookHandler, HookEvent } from '../../types/project';

const HOOK_EVENTS: { value: HookEvent; label: string; desc: string }[] = [
  { value: 'PreToolUse', label: 'PreToolUse', desc: '도구 실행 전' },
  { value: 'PostToolUse', label: 'PostToolUse', desc: '도구 실행 후' },
  { value: 'Stop', label: 'Stop', desc: '응답 완료' },
  { value: 'UserPromptSubmit', label: 'UserPromptSubmit', desc: '프롬프트 제출' },
  { value: 'SessionStart', label: 'SessionStart', desc: '세션 시작' },
  { value: 'SessionEnd', label: 'SessionEnd', desc: '세션 종료' },
  { value: 'Notification', label: 'Notification', desc: '알림 발생' },
  { value: 'SubagentStart', label: 'SubagentStart', desc: '서브에이전트 시작' },
  { value: 'SubagentStop', label: 'SubagentStop', desc: '서브에이전트 종료' },
];

interface HooksEditorProps {
  onClose: () => void;
}

export function HooksEditor({ onClose }: HooksEditorProps) {
  const { projectConfig, setHooks } = useCanvasContext();
  const [hooks, setLocalHooks] = useState<HookHandler[]>(projectConfig.hooks);

  const addHook = useCallback(() => {
    setLocalHooks((prev) => [...prev, { event: 'PreToolUse', type: 'command', command: '' }]);
  }, []);

  const updateHook = useCallback((index: number, field: keyof HookHandler, value: unknown) => {
    setLocalHooks((prev) =>
      prev.map((h, i) => (i === index ? { ...h, [field]: value } : h)),
    );
  }, []);

  const removeHook = useCallback((index: number) => {
    setLocalHooks((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSave = () => {
    setHooks(hooks.filter((h) => h.command?.trim() || h.url?.trim()));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="mx-4 flex h-[80vh] w-full max-w-2xl flex-col rounded-lg bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Hooks</h2>
            <p className="text-xs text-gray-500">라이프사이클 이벤트 핸들러 설정</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleSave} className="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800">Save</button>
            <button onClick={onClose} className="rounded p-1 text-gray-400 hover:bg-gray-100">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {hooks.map((hook, i) => (
            <div key={i} className="mb-4 rounded-lg border border-gray-200 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500">Hook {i + 1}</span>
                <button onClick={() => removeHook(i)} className="text-xs text-gray-400 hover:text-red-500">삭제</button>
              </div>
              <div className="flex flex-col gap-2">
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Event</label>
                  <select
                    value={hook.event}
                    onChange={(e) => updateHook(i, 'event', e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                  >
                    {HOOK_EVENTS.map((ev) => (
                      <option key={ev.value} value={ev.value}>
                        {ev.label} — {ev.desc}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs text-gray-500">Type</label>
                  <div className="flex gap-1">
                    {(['command', 'http'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => updateHook(i, 'type', t)}
                        className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium ${
                          hook.type === t ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {hook.type === 'command' && (
                  <input
                    placeholder="command (예: npm run lint)"
                    value={hook.command ?? ''}
                    onChange={(e) => updateHook(i, 'command', e.target.value)}
                    className="rounded-md border border-gray-300 px-2.5 py-1.5 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                )}

                {hook.type === 'http' && (
                  <input
                    placeholder="URL (예: http://localhost:3000/hook)"
                    value={hook.url ?? ''}
                    onChange={(e) => updateHook(i, 'url', e.target.value)}
                    className="rounded-md border border-gray-300 px-2.5 py-1.5 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                )}
              </div>
            </div>
          ))}

          <button
            onClick={addHook}
            className="w-full rounded-lg border-2 border-dashed border-gray-300 py-2.5 text-sm text-gray-500 hover:border-gray-400 hover:text-gray-700"
          >
            + Hook 추가
          </button>
        </div>
      </div>
    </div>
  );
}
