import { useMapStore } from '../store/useMapStore';

export function ZoomControl() {
  const map = useMapStore((s) => s.map);
  if (!map) return null;

  const zoomIn = () => {
    try {
      map.zoomIn ? map.zoomIn() : map.setZoom(map.getZoom() + 1);
    } catch {}
  };

  const zoomOut = () => {
    try {
      map.zoomOut ? map.zoomOut() : map.setZoom(map.getZoom() - 1);
    } catch {}
  };

  const btnStyle: React.CSSProperties = {
    width: 36,
    height: 36,
    border: 'none',
    background: '#fff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    cursor: 'pointer',
    fontSize: 18,
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#333',
    lineHeight: 1,
  };

  return (
    <div style={{
      position: 'absolute',
      bottom: 12,
      right: 12,
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      borderRadius: 6,
      overflow: 'hidden',
    }}>
      <button onClick={zoomIn} title="放大" style={{ ...btnStyle, borderBottom: '1px solid #eee' }}>
        +
      </button>
      <button onClick={zoomOut} title="缩小" style={btnStyle}>
        −
      </button>
    </div>
  );
}
