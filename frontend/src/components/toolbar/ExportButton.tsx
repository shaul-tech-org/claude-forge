import { useCallback, useState } from 'react';
import { useCanvasContext } from '../../contexts/CanvasContext';
import { exportToZip, downloadBlob } from '../../lib/export';

export function ExportButton() {
  const { nodes, projectConfig } = useCanvasContext();
  const [exporting, setExporting] = useState(false);

  const hasContent = nodes.length > 0 || Boolean(projectConfig.claudeMd);

  const handleExport = useCallback(async () => {
    if (!hasContent) return;
    setExporting(true);
    try {
      const blob = await exportToZip(nodes, projectConfig);
      downloadBlob(blob, 'claude-config.zip');
    } finally {
      setExporting(false);
    }
  }, [nodes, projectConfig, hasContent]);

  return (
    <div className="border-t border-gray-200 px-4 py-3">
      <button
        onClick={handleExport}
        disabled={!hasContent || exporting}
        className="w-full rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        {exporting ? 'Exporting...' : 'Export ZIP'}
      </button>
    </div>
  );
}
