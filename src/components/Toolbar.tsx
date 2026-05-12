import { useMapStore } from '../store/useMapStore';
import type { ToolType } from '../types';
import { IconPalette } from './IconPalette';
import { TerrainBrush } from './TerrainBrush';

const tools: { type: ToolType; label: string; icon: string }[] = [
  { type: 'select', label: '选择', icon: '⊹' },
  { type: 'pen', label: '画笔', icon: '✎' },
  { type: 'highlighter', label: '荧光笔', icon: '🖍' },
  { type: 'eraser', label: '橡皮擦', icon: '◌' },
  { type: 'icon', label: '图标', icon: '📍' },
  { type: 'text', label: '文字', icon: 'T' },
  { type: 'terrain', label: '地形纹理', icon: '▣' },
  { type: 'territory', label: '疆域', icon: '◈' },
];

export function Toolbar() {
  const currentProjectId = useMapStore((s) => s.currentProjectId);
  const activeTool = useMapStore((s) => s.activeTool);
  const setActiveTool = useMapStore((s) => s.setActiveTool);

  // Unified brush mode
  const brushMode = useMapStore((s) => s.brushMode);
  const setBrushMode = useMapStore((s) => s.setBrushMode);

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
  const eraserMode = useMapStore((s) => s.eraserMode);
  const setEraserMode = useMapStore((s) => s.setEraserMode);

  // Icon
  const selectedIcon = useMapStore((s) => s.selectedIcon);
  const setSelectedIcon = useMapStore((s) => s.setSelectedIcon);

  // Territory
  const territoryColor = useMapStore((s) => s.territoryColor);
  const setTerritoryColor = useMapStore((s) => s.setTerritoryColor);

  // Line width scaling
  const lineWidthMode = useMapStore((s) => s.lineWidthMode);
  const setLineWidthMode = useMapStore((s) => s.setLineWidthMode);

  if (!currentProjectId) return null;

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
      {/* Sub-panels */}
      {activeTool === 'icon' && (
        <IconPalette onSelect={(emoji: string) => {
          setSelectedIcon(emoji);
        }} />
      )}
      {activeTool === 'terrain' && <TerrainBrush />}

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
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '2px 0', flexWrap: 'wrap', justifyContent: 'center' }}>
        {activeTool === 'pen' && (
          <>
            {/* Brush mode toggle */}
            <div style={{ display: 'flex', gap: 2, background: '#f0f0f0', borderRadius: 4, padding: 2 }}>
              <button
                onClick={() => setBrushMode('solid')}
                style={{
                  padding: '3px 10px',
                  border: 'none',
                  borderRadius: 3,
                  background: brushMode === 'solid' ? '#1a73e8' : 'transparent',
                  color: brushMode === 'solid' ? '#fff' : '#666',
                  fontSize: 11,
                  cursor: 'pointer',
                  fontWeight: brushMode === 'solid' ? 600 : 400,
                }}
              >
                纯色
              </button>
              <button
                onClick={() => setBrushMode('texture')}
                style={{
                  padding: '3px 10px',
                  border: 'none',
                  borderRadius: 3,
                  background: brushMode === 'texture' ? '#1a73e8' : 'transparent',
                  color: brushMode === 'texture' ? '#fff' : '#666',
                  fontSize: 11,
                  cursor: 'pointer',
                  fontWeight: brushMode === 'texture' ? 600 : 400,
                }}
              >
                纹理
              </button>
            </div>

            {brushMode === 'solid' ? (
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
            ) : (
              <TerrainBrush compact />
            )}

            {/* Line width scaling toggle */}
            <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#888', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={lineWidthMode === 'map'}
                onChange={(e) => setLineWidthMode(e.target.checked ? 'map' : 'screen')}
              />
              随缩放
            </label>
          </>
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
            <div style={{ display: 'flex', gap: 2, background: '#f0f0f0', borderRadius: 4, padding: 2 }}>
              <button
                onClick={() => setEraserMode('click')}
                style={{
                  padding: '3px 10px',
                  border: 'none',
                  borderRadius: 3,
                  background: eraserMode === 'click' ? '#1a73e8' : 'transparent',
                  color: eraserMode === 'click' ? '#fff' : '#666',
                  fontSize: 11,
                  cursor: 'pointer',
                  fontWeight: eraserMode === 'click' ? 600 : 400,
                }}
              >
                点选
              </button>
              <button
                onClick={() => setEraserMode('cut')}
                style={{
                  padding: '3px 10px',
                  border: 'none',
                  borderRadius: 3,
                  background: eraserMode === 'cut' ? '#1a73e8' : 'transparent',
                  color: eraserMode === 'cut' ? '#fff' : '#666',
                  fontSize: 11,
                  cursor: 'pointer',
                  fontWeight: eraserMode === 'cut' ? 600 : 400,
                }}
              >
                切割
              </button>
            </div>
            {eraserMode === 'click' && (
              <>
                <label style={{ fontSize: 12, color: '#666' }}>大小</label>
                <input
                  type="range"
                  min={5}
                  max={30}
                  value={eraserSize}
                  onChange={(e) => setEraserSize(Number(e.target.value))}
                  style={{ width: 60 }}
                  title={`${eraserSize}px`}
                />
                <span style={{ fontSize: 11, color: '#999', minWidth: 24 }}>{eraserSize}px</span>
              </>
            )}
            {eraserMode === 'cut' && (
              <span style={{ fontSize: 11, color: '#999' }}>拖拽画线切割路径</span>
            )}
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

        {activeTool === 'terrain' && (
          <TerrainBrush compact />
        )}

        {activeTool === 'territory' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <label style={{ fontSize: 12, color: '#666' }}>疆域颜色</label>
            <input
              type="color"
              value={territoryColor}
              onChange={(e) => setTerritoryColor(e.target.value)}
              style={{ width: 26, height: 26, border: 'none', cursor: 'pointer', padding: 0 }}
            />
            <span style={{ fontSize: 11, color: '#999' }}>拖拽画闭合区域</span>
          </div>
        )}
      </div>
    </div>
  );
}
