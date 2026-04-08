import { useMemo, useState, useCallback } from 'react';
import { useCanvasContext } from '../../contexts/CanvasContext';
import { buildClaudeTree, type TreeEntry } from '../../lib/tree';
import { buildFileList, type FileEntry } from '../../lib/export';
import { FilePreviewModal } from './FilePreviewModal';

function TreeNode({ entry, depth = 0, isLast = false, prefix = '', currentPath = '', onFileClick }: {
  entry: TreeEntry;
  depth?: number;
  isLast?: boolean;
  prefix?: string;
  currentPath?: string;
  onFileClick?: (path: string) => void;
}) {
  const connector = depth === 0 ? '' : isLast ? '└── ' : '├── ';
  const childPrefix = depth === 0 ? '' : prefix + (isLast ? '    ' : '│   ');
  const fullPath = currentPath ? `${currentPath}/${entry.name}` : entry.name;

  return (
    <>
      <div
        className={`whitespace-pre font-mono text-xs leading-5 ${
          !entry.isDir ? 'cursor-pointer rounded hover:bg-gray-100' : ''
        }`}
        onClick={!entry.isDir && onFileClick ? () => onFileClick(fullPath) : undefined}
      >
        <span className="text-gray-400">{prefix}{connector}</span>
        <span className={entry.isDir ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900'}>
          {entry.name}{entry.isDir ? '/' : ''}
        </span>
      </div>
      {entry.children?.map((child, i) => (
        <TreeNode
          key={child.name + i}
          entry={child}
          depth={depth + 1}
          isLast={i === entry.children!.length - 1}
          prefix={childPrefix}
          currentPath={fullPath}
          onFileClick={onFileClick}
        />
      ))}
    </>
  );
}

export function FolderPreview() {
  const { nodes, projectConfig } = useCanvasContext();
  const [selectedFile, setSelectedFile] = useState<FileEntry | null>(null);

  const tree = useMemo(() => buildClaudeTree(nodes), [nodes]);
  const fileList = useMemo(() => buildFileList(nodes, projectConfig), [nodes, projectConfig]);

  const hasContent = nodes.length > 0 || Boolean(projectConfig.claudeMd);

  const handleFileClick = useCallback(
    (path: string) => {
      const file = fileList.find((f) => f.path === path);
      if (file) setSelectedFile(file);
    },
    [fileList],
  );

  return (
    <>
      <div className="border-t border-gray-200 px-4 py-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Preview
        </p>
        {hasContent ? (
          <div className="max-h-48 overflow-y-auto">
            <TreeNode entry={tree} onFileClick={handleFileClick} />
          </div>
        ) : (
          <p className="text-xs text-gray-400">노드를 추가하면 폴더 구조가 표시됩니다</p>
        )}
      </div>

      {selectedFile && (
        <FilePreviewModal
          path={selectedFile.path}
          content={selectedFile.content}
          onClose={() => setSelectedFile(null)}
        />
      )}
    </>
  );
}
