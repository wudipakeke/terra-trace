import type { SaveStatus } from '../../types/novel';

interface SaveStatusBarProps {
  wordCount: number;
  saveStatus: SaveStatus;
  storageUsed: string;
  storagePercent: string;
  onSave: () => void;
  onExport: () => void;
}

export function SaveStatusBar({
  wordCount,
  saveStatus,
  storageUsed,
  storagePercent,
  onSave,
  onExport,
}: SaveStatusBarProps) {
  const statusColor =
    saveStatus === 'saved' ? 'text-green-600' :
    saveStatus === 'saving' ? 'text-gray-400' :
    'text-orange-500';

  const statusLabel =
    saveStatus === 'saved' ? '✓ 已自动保存' :
    saveStatus === 'saving' ? '○ 保存中...' :
    '⚠ 未保存';

  return (
    <div className="flex items-center justify-between px-4 py-1.5 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
      <div className="flex items-center gap-4">
        <span className="font-medium text-gray-700">
          {wordCount.toLocaleString()} 字
        </span>
        <span className={statusColor}>{statusLabel}</span>
        <span className="text-gray-400">
          Ctrl+S 手动保存
        </span>
      </div>
      <div className="flex items-center gap-4">
        <span>存储: {storageUsed} / {storagePercent}</span>
        <button
          onClick={onExport}
          className="text-blue-600 hover:text-blue-800 cursor-pointer"
        >
          导出 TXT
        </button>
      </div>
    </div>
  );
}
