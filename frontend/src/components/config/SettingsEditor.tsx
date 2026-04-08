import { useState, useEffect, useCallback } from 'react';
import { useCanvasContext } from '../../contexts/CanvasContext';
import type { ProjectSettings } from '../../types/project';

interface SettingsEditorProps {
  onClose: () => void;
}

export function SettingsEditor({ onClose }: SettingsEditorProps) {
  const { projectConfig, setProjectSettings } = useCanvasContext();
  const [settings, setSettings] = useState<ProjectSettings>(projectConfig.settings);
  const [newPermission, setNewPermission] = useState({ pattern: '', mode: 'allow' as 'allow' | 'deny' | 'ask' });
  const [newEnvKey, setNewEnvKey] = useState('');
  const [newEnvVal, setNewEnvVal] = useState('');

  useEffect(() => {
    setSettings(projectConfig.settings);
  }, [projectConfig.settings]);

  const handleSave = () => {
    setProjectSettings(settings);
    onClose();
  };

  const addPermission = useCallback(() => {
    if (!newPermission.pattern.trim()) return;
    setSettings((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [newPermission.mode]: [...prev.permissions[newPermission.mode], newPermission.pattern.trim()],
      },
    }));
    setNewPermission({ pattern: '', mode: 'allow' });
  }, [newPermission]);

  const removePermission = useCallback((mode: 'allow' | 'deny' | 'ask', index: number) => {
    setSettings((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [mode]: prev.permissions[mode].filter((_, i) => i !== index),
      },
    }));
  }, []);

  const addEnvVar = useCallback(() => {
    if (!newEnvKey.trim()) return;
    setSettings((prev) => ({
      ...prev,
      env: { ...prev.env, [newEnvKey.trim()]: newEnvVal },
    }));
    setNewEnvKey('');
    setNewEnvVal('');
  }, [newEnvKey, newEnvVal]);

  const removeEnvVar = useCallback((key: string) => {
    setSettings((prev) => {
      const env = Object.fromEntries(
        Object.entries(prev.env).filter(([k]) => k !== key),
      );
      return { ...prev, env };
    });
  }, []);

  const PERMISSION_COLORS = {
    allow: 'bg-green-50 border-green-200 text-green-700',
    deny: 'bg-red-50 border-red-200 text-red-700',
    ask: 'bg-amber-50 border-amber-200 text-amber-700',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="mx-4 flex h-[80vh] w-full max-w-2xl flex-col rounded-lg bg-white shadow-xl"
        onClick={(e) => { e.stopPropagation(); }}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <div>
            <h2 className="text-sm font-bold text-gray-900">settings.json</h2>
            <p className="text-xs text-gray-500">프로젝트 권한, 환경변수, 모델 설정</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800"
            >
              Save
            </button>
            <button
              onClick={onClose}
              className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {/* Model */}
          <div className="mb-6">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-400">
              Model
            </label>
            <div className="flex gap-1">
              {['', 'claude-sonnet-4-6', 'claude-opus-4-6', 'claude-haiku-4-5-20251001'].map((m) => (
                <button
                  key={m}
                  onClick={() => { setSettings((prev) => ({ ...prev, model: m })); }}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    settings.model === m
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {m || 'Default'}
                </button>
              ))}
            </div>
          </div>

          {/* Permissions */}
          <div className="mb-6">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
              Permissions
            </label>

            {(['allow', 'deny', 'ask'] as const).map((mode) => (
              <div key={mode} className="mb-2">
                <p className="mb-1 text-xs font-medium capitalize text-gray-600">{mode}</p>
                <div className="flex flex-wrap gap-1">
                  {settings.permissions[mode].map((pattern, i) => (
                    <span
                      key={pattern + String(i)}
                      className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 font-mono text-xs ${PERMISSION_COLORS[mode]}`}
                    >
                      {pattern}
                      <button onClick={() => { removePermission(mode, i); }} className="hover:opacity-70">&times;</button>
                    </span>
                  ))}
                  {settings.permissions[mode].length === 0 && (
                    <span className="text-xs text-gray-400">none</span>
                  )}
                </div>
              </div>
            ))}

            <div className="mt-2 flex gap-1">
              <select
                value={newPermission.mode}
                onChange={(e) => { setNewPermission((p) => ({ ...p, mode: e.target.value as 'allow' | 'deny' | 'ask' })); }}
                className="rounded-md border border-gray-300 px-2 py-1.5 text-xs"
              >
                <option value="allow">allow</option>
                <option value="deny">deny</option>
                <option value="ask">ask</option>
              </select>
              <input
                type="text"
                value={newPermission.pattern}
                onChange={(e) => { setNewPermission((p) => ({ ...p, pattern: e.target.value })); }}
                onKeyDown={(e) => { if (e.key === 'Enter') addPermission(); }}
                placeholder='Bash, Edit, "Bash(command:npm*)" ...'
                className="flex-1 rounded-md border border-gray-300 px-2.5 py-1.5 font-mono text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                onClick={addPermission}
                className="rounded-md bg-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-300"
              >
                +
              </button>
            </div>
          </div>

          {/* Environment Variables */}
          <div className="mb-6">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
              Environment Variables
            </label>
            {Object.entries(settings.env).map(([key, val]) => (
              <div key={key} className="mb-1 flex items-center gap-1">
                <span className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-700">{key}</span>
                <span className="text-xs text-gray-400">=</span>
                <span className="truncate font-mono text-xs text-gray-600">{val}</span>
                <button onClick={() => { removeEnvVar(key); }} className="ml-auto text-xs text-gray-400 hover:text-red-500">&times;</button>
              </div>
            ))}
            <div className="mt-2 flex gap-1">
              <input
                type="text"
                value={newEnvKey}
                onChange={(e) => { setNewEnvKey(e.target.value); }}
                placeholder="KEY"
                className="w-28 rounded-md border border-gray-300 px-2.5 py-1.5 font-mono text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <input
                type="text"
                value={newEnvVal}
                onChange={(e) => { setNewEnvVal(e.target.value); }}
                onKeyDown={(e) => { if (e.key === 'Enter') addEnvVar(); }}
                placeholder="value"
                className="flex-1 rounded-md border border-gray-300 px-2.5 py-1.5 font-mono text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                onClick={addEnvVar}
                className="rounded-md bg-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-300"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
