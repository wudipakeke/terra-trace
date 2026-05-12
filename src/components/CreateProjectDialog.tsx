import { useState } from 'react';
import { useMapStore } from '../store/useMapStore';
import { BackgroundColorPicker } from './BackgroundColorPicker';

interface Props {
  onClose: () => void;
}

const LOCKED_MAP_TYPE = 'maplibre-outdoor-contour' as const;

export function CreateProjectDialog({ onClose }: Props) {
  const createProject = useMapStore((s) => s.createProject);
  const openProject = useMapStore((s) => s.openProject);

  const [name, setName] = useState('');
  const [bgColor, setBgColor] = useState('#F5F0E8');

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const id = createProject(trimmed, LOCKED_MAP_TYPE, bgColor);
    onClose();
    openProject(id);
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
          创建世界观地图
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
            placeholder="输入项目名称..."
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
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

        {/* Map type — locked */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#555', marginBottom: 6 }}>
            底图类型
          </label>
          <div
            style={{
              padding: '10px 12px',
              background: '#f5f0e8',
              borderRadius: 6,
              fontSize: 13,
              color: '#666',
            }}
          >
            MapTiler Outdoor 地形图<span style={{ color: '#999', marginLeft: 8 }}>（含等高线，创建后不可更改）</span>
          </div>
        </div>

        {/* Background Color */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#555', marginBottom: 6 }}>
            背景颜色
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
            onClick={handleSubmit}
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
            确定
          </button>
        </div>
      </div>
    </div>
  );
}
