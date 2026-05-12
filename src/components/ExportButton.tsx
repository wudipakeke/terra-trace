import { useState } from 'react';
import { useMapStore } from '../store/useMapStore';
import type { ExportOptions } from '../types';
import { DEFAULT_EXPORT_OPTIONS } from '../types';
import { exportProjectAsSvg, downloadSvg } from '../utils/svgExport';

export function ExportButton() {
  const projects = useMapStore((s) => s.projects);
  const currentProjectId = useMapStore((s) => s.currentProjectId);
  const exportOptions = useMapStore((s) => s.exportOptions);
  const setExportOptions = useMapStore((s) => s.setExportOptions);

  const [showPanel, setShowPanel] = useState(false);

  const project = projects.find((p) => p.id === currentProjectId);

  const handleExport = () => {
    if (!project) return;
    if (project.elements.length === 0) {
      alert('当前项目没有任何元素');
      return;
    }
    const svg = exportProjectAsSvg(project, exportOptions);
    if (!svg) return;
    const scaleLabel = exportOptions.scale === 1 ? '' : `@${exportOptions.scale}x`;
    const filename = `${project.name}${scaleLabel}.svg`;
    downloadSvg(svg, filename);
    setShowPanel(false);
  };

  if (!project) return null;

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setShowPanel(!showPanel)}
        title="导出"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 12px',
          borderRadius: 6,
          border: '1px solid #1a73e8',
          background: showPanel ? '#e8f0fe' : '#fff',
          color: '#1a73e8',
          cursor: 'pointer',
          fontSize: 13,
          fontWeight: 500,
        }}
      >
        <span style={{ fontSize: 16 }}>↓</span>
        导出
      </button>

      {showPanel && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 299 }} onClick={() => setShowPanel(false)} />
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              right: 0,
              zIndex: 300,
              background: '#fff',
              borderRadius: 8,
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              padding: 16,
              width: 220,
              fontSize: 13,
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 12, color: '#333' }}>
              导出选项
            </div>

            {/* Resolution */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>分辨率</div>
              <div style={{ display: 'flex', gap: 4 }}>
                {([1, 2, 4] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setExportOptions({ ...exportOptions, scale: s })}
                    style={{
                      flex: 1,
                      padding: '4px 0',
                      border: '1px solid',
                      borderRadius: 4,
                      borderColor: exportOptions.scale === s ? '#1a73e8' : '#ddd',
                      background: exportOptions.scale === s ? '#e8f0fe' : '#fff',
                      color: exportOptions.scale === s ? '#1a73e8' : '#666',
                      cursor: 'pointer',
                      fontSize: 12,
                    }}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>

            {/* Toggles */}
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, cursor: 'pointer', fontSize: 12 }}>
              <input
                type="checkbox"
                checked={exportOptions.includeBackground}
                onChange={(e) => setExportOptions({ ...exportOptions, includeBackground: e.target.checked })}
              />
              宣纸背景
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, cursor: 'pointer', fontSize: 12 }}>
              <input
                type="checkbox"
                checked={exportOptions.includeBorder}
                onChange={(e) => setExportOptions({ ...exportOptions, includeBorder: e.target.checked })}
              />
              古风边框
            </label>

            <div style={{ borderTop: '1px solid #eee', margin: '8px 0' }} />

            <button
              onClick={handleExport}
              style={{
                width: '100%',
                padding: '8px 0',
                border: 'none',
                borderRadius: 6,
                background: '#1a73e8',
                color: '#fff',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              导出 SVG
            </button>
          </div>
        </>
      )}
    </div>
  );
}
