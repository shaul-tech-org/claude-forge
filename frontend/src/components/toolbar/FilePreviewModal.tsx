import { useState, useCallback } from 'react';

interface FilePreviewModalProps {
  path: string;
  content: string;
  onClose: () => void;
}

export function FilePreviewModal({ path, content, onClose }: FilePreviewModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => { setCopied(false); }, 2000);
  }, [content]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="mx-4 flex max-h-[80vh] w-full max-w-2xl flex-col rounded-lg bg-white shadow-xl"
        onClick={(e) => { e.stopPropagation(); }}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <code className="text-sm font-medium text-gray-700">{path}</code>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { void handleCopy(); }}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                copied
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {copied ? 'Copied!' : 'Copy'}
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
          <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-gray-800">
            {content}
          </pre>
        </div>
      </div>
    </div>
  );
}
