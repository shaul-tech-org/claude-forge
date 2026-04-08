import { useState, useEffect } from 'react';
import { useCanvasContext } from '../../contexts/CanvasContext';

const TEMPLATE = `# Project Name

## Build & Test
\`\`\`bash
# Build
npm run build

# Test
npm test

# Lint
npm run lint
\`\`\`

## Architecture
-

## Coding Conventions
-

## Important Notes
-
`;

interface ClaudeMdEditorProps {
  onClose: () => void;
}

export function ClaudeMdEditor({ onClose }: ClaudeMdEditorProps) {
  const { projectConfig, setClaudeMd } = useCanvasContext();
  const [content, setContent] = useState(projectConfig.claudeMd);

  useEffect(() => {
    setContent(projectConfig.claudeMd);
  }, [projectConfig.claudeMd]);

  const handleSave = () => {
    setClaudeMd(content);
    onClose();
  };

  const handleTemplate = () => {
    if (content && !confirm('현재 내용을 템플릿으로 교체하시겠습니까?')) return;
    setContent(TEMPLATE);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="mx-4 flex h-[80vh] w-full max-w-3xl flex-col rounded-lg bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <div>
            <h2 className="text-sm font-bold text-gray-900">CLAUDE.md</h2>
            <p className="text-xs text-gray-500">프로젝트 instructions — 모든 세션에 로드됩니다</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleTemplate}
              className="rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200"
            >
              Template
            </button>
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
        <div className="flex-1 p-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="# My Project&#10;&#10;## Build & Test&#10;..."
            className="h-full w-full resize-none rounded-md border border-gray-300 px-4 py-3 font-mono text-sm leading-relaxed focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}
