import { useState } from 'react';
import type { TracingProject } from '../types';
import { BackgroundColorPicker } from './BackgroundColorPicker';

interface Props {
  project: TracingProject;
  onClose: () => void;
  onSave: (name: string, backgroundColor: string) => void;
}

export function EditProjectDialog({ project, onClose, onSave }: Props) {
  const [name, setName] = useState(project.name);
  const [bgColor, setBgColor] = useState(project.backgroundColor);

  const MAP_LABEL = 'MapTiler Outdoor（含等高线）';

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave(trimmed, bgColor);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          padding: 24,
          width: 440,
          boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: '#222' }}>
          编辑项目
        </div>

        {/* Project Name */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#555', marginBottom: 6 }}>
            项目名称
          </label>
          <input
            autoFocus
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            style={{
              width: '100%',
              padding: '8px 12px',
              fontSize: 14,
              border: '2px solid #ddd',
              borderRadius: 6,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Map Type (read-only) */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#555', marginBottom: 6 }}>
            地图类型 <span style={{ fontWeight: 400, color: '#999' }}>(不可修改)</span>
          </label>
          <div
            style={{
              padding: '8px 12px',
              fontSize: 13,
              border: '1px solid #e0e0e0',
              borderRadius: 6,
              background: '#f5f5f5',
              color: '#888',
            }}
          >
            {MAP_LABEL}
          </div>
        </div>

        {/* Background Color */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#555', marginBottom: 6 }}>
            临摹背景颜色
          </label>
          <BackgroundColorPicker value={bgColor} onChange={setBgColor} />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 20px',
              borderRadius: 6,
              border: '1px solid #ddd',
              background: '#fff',
              cursor: 'pointer',
              fontSize: 14,
              color: '#666',
            }}
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            style={{
              padding: '8px 20px',
              borderRadius: 6,
              border: 'none',
              background: name.trim() ? '#1a73e8' : '#ccc',
              color: '#fff',
              cursor: name.trim() ? 'pointer' : 'not-allowed',
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
