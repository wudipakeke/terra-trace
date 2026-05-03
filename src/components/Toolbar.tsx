import { useMapStore } from '../store/useMapStore';
import type { ToolType } from '../types';
import { IconPalette } from './IconPalette';

const tools: { type: ToolType; label: string; icon: string }[] = [
  { type: 'select', label: '选择', icon: '⊹' },
  { type: 'pen', label: '画笔', icon: '✎' },
  { type: 'highlighter', label: '荧光笔', icon: '🖍' },
  { type: 'eraser', label: '橡皮擦', icon: '◌' },
  { type: 'icon', label: '图标', icon: '📍' },
  { type: 'text', label: '文字', icon: 'T' },
];

export function Toolbar() {
  const layers = useMapStore((s) => s.layers);
  const activeTool = useMapStore((s) => s.activeTool);
  const setActiveTool = useMapStore((s) => s.setActiveTool);

  // Pen styles
  const strokeColor = useMapStore((s) => s.strokeColor);
  const setStrokeColor = useMapStore((s) => s.setStrokeColor);
  const strokeWidth = useMapStore((s) => s.strokeWidth);
  const setStrokeWidth = useMapStore((s) => s.setStrokeWidth);

  // Highlighter styles
  const highlighterColor = useMapStore((s) => s.highlighterColor);
  const setHighlighterColor = useMapStore((s) => s.setHighlighterColor);
  const highlighterWidth = useMapStore((s) => s.highlighterWidth);
  const setHighlighterWidth = useMapStore((s) => s.setHighlighterWidth);
  const highlighterOpacity = useMapStore((s) => s.highlighterOpacity);
  const setHighlighterOpacity = useMapStore((s) => s.setHighlighterOpacity);

  // Eraser
  const eraserSize = useMapStore((s) => s.eraserSize);
  const setEraserSize = useMapStore((s) => s.setEraserSize);

  // Icon
  const selectedIcon = useMapStore((s) => s.selectedIcon);
  const setSelectedIcon = useMapStore((s) => s.setSelectedIcon);

  if (layers.length === 0) return null;

  return (
    <div style={{
      position: 'absolute',
      bottom: 12,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 100,
      background: '#fff',
      borderRadius: 8,
      boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 4,
      padding: '4px 8px',
    }}>
      {/* Icon palette popup */}
      {activeTool === 'icon' && (
        <IconPalette onSelect={(emoji: string) => {
          setSelectedIcon(emoji);
        }} />
      )}

      {/* Tool buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {tools.map((t) => (
          <button
            key={t.type}
            title={t.label}
            onClick={() => setActiveTool(t.type)}
            style={{
              width: 36,
              height: 36,
              border: 'none',
              borderRadius: 6,
              background: activeTool === t.type ? '#1a73e8' : 'transparent',
              color: activeTool === t.type ? '#fff' : '#555',
              fontSize: 18,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {t.icon}
          </button>
        ))}
      </div>

      {/* Conditional style controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '2px 0' }}>
        {activeTool === 'pen' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <label style={{ fontSize: 12, color: '#666' }}>颜色</label>
            <input
              type="color"
              value={strokeColor}
              onChange={(e) => setStrokeColor(e.target.value)}
              style={{ width: 26, height: 26, border: 'none', cursor: 'pointer', padding: 0 }}
            />
            <label style={{ fontSize: 12, color: '#666' }}>粗细</label>
            <input
              type="range"
              min={1}
              max={20}
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(Number(e.target.value))}
              style={{ width: 60 }}
              title={`${strokeWidth}px`}
            />
            <span style={{ fontSize: 11, color: '#999', minWidth: 24 }}>{strokeWidth}px</span>
          </div>
        )}

        {activeTool === 'highlighter' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <label style={{ fontSize: 12, color: '#666' }}>颜色</label>
            <input
              type="color"
              value={highlighterColor}
              onChange={(e) => setHighlighterColor(e.target.value)}
              style={{ width: 26, height: 26, border: 'none', cursor: 'pointer', padding: 0 }}
            />
            <label style={{ fontSize: 12, color: '#666' }}>粗细</label>
            <input
              type="range"
              min={5}
              max={40}
              value={highlighterWidth}
              onChange={(e) => setHighlighterWidth(Number(e.target.value))}
              style={{ width: 60 }}
              title={`${highlighterWidth}px`}
            />
            <label style={{ fontSize: 12, color: '#666' }}>透明</label>
            <input
              type="range"
              min={5}
              max={80}
              value={Math.round(highlighterOpacity * 100)}
              onChange={(e) => setHighlighterOpacity(Number(e.target.value) / 100)}
              style={{ width: 50 }}
              title={`${Math.round(highlighterOpacity * 100)}%`}
            />
          </div>
        )}

        {activeTool === 'eraser' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <label style={{ fontSize: 12, color: '#666' }}>大小</label>
            <input
              type="range"
              min={5}
              max={30}
              value={eraserSize}
              onChange={(e) => setEraserSize(Number(e.target.value))}
              style={{ width: 80 }}
              title={`${eraserSize}px`}
            />
            <span style={{ fontSize: 11, color: '#999', minWidth: 24 }}>{eraserSize}px</span>
          </div>
        )}

        {activeTool === 'icon' && (
          <span style={{ fontSize: 12, color: '#999' }}>
            当前: <span style={{ fontSize: 20 }}>{selectedIcon}</span> — 点击地图放置
          </span>
        )}

        {activeTool === 'text' && (
          <span style={{ fontSize: 12, color: '#999' }}>
            点击地图输入文字
          </span>
        )}
      </div>
    </div>
  );
}
