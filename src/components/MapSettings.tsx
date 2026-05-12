import { useMapStore } from '../store/useMapStore';

export function MapSettings() {
  const showContours = useMapStore((s) => s.showContours);
  const setShowContours = useMapStore((s) => s.setShowContours);
  const mapOpacity = useMapStore((s) => s.mapOpacity);
  const setMapOpacity = useMapStore((s) => s.setMapOpacity);
  const showBorder = useMapStore((s) => s.showBorder);
  const setShowBorder = useMapStore((s) => s.setShowBorder);

  return (
    <div style={{ fontSize: 13 }}>
      <strong style={{ fontSize: 14, display: 'block', marginBottom: 10 }}>地图设置</strong>

      {/* Map opacity */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
          底图透明度: {Math.round(mapOpacity * 100)}%
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(mapOpacity * 100)}
          onChange={(e) => setMapOpacity(Number(e.target.value) / 100)}
          style={{ width: '100%' }}
        />
      </div>

      <div style={{ borderTop: '1px solid #eee', marginBottom: 8 }} />

      {/* Contour overlay toggle */}
      <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, cursor: 'pointer', fontSize: 12 }}>
        <input
          type="checkbox"
          checked={showContours}
          onChange={(e) => setShowContours(e.target.checked)}
        />
        叠加等高线
      </label>

      {/* Border toggle */}
      <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 12 }}>
        <input
          type="checkbox"
          checked={showBorder}
          onChange={(e) => setShowBorder(e.target.checked)}
        />
        古风边框装饰
      </label>
    </div>
  );
}
