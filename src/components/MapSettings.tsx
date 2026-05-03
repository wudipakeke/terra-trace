import { useMapStore } from '../store/useMapStore';

const hasMapTilerKey = Boolean(import.meta.env.VITE_MAPTILER_API_KEY);

export function MapSettings() {
  const mapProvider = useMapStore((s) => s.mapProvider);
  const setMapProvider = useMapStore((s) => s.setMapProvider);
  const amapMapType = useMapStore((s) => s.amapMapType);
  const setAmapMapType = useMapStore((s) => s.setAmapMapType);
  const amapShowRoadNet = useMapStore((s) => s.amapShowRoadNet);
  const setAmapShowRoadNet = useMapStore((s) => s.setAmapShowRoadNet);
  const maplibreStyle = useMapStore((s) => s.maplibreStyle);
  const setMaplibreStyle = useMapStore((s) => s.setMaplibreStyle);
  const terrainEnabled = useMapStore((s) => s.terrainEnabled);
  const setTerrainEnabled = useMapStore((s) => s.setTerrainEnabled);
  const maplibrePitch = useMapStore((s) => s.maplibrePitch);
  const setMaplibrePitch = useMapStore((s) => s.setMaplibrePitch);
  const showContours = useMapStore((s) => s.showContours);
  const setShowContours = useMapStore((s) => s.setShowContours);

  const STYLE_OPTIONS: { id: string; label: string; desc: string }[] = [
    { id: 'topo', label: 'Topo', desc: '等高线地形图' },
    { id: 'topo-topographique', label: 'Topographique', desc: '自然色地形渲染' },
    { id: 'outdoor', label: 'Outdoor', desc: '户外运动/徒步' },
    { id: 'landscape', label: 'Landscape', desc: '景观山体阴影' },
    { id: 'streets', label: 'Streets', desc: '街道地图' },
  ];

  return (
    <div style={{ fontSize: 13 }}>
      <strong style={{ fontSize: 14, display: 'block', marginBottom: 10 }}>地图源</strong>

      {/* Provider switch */}
      <div style={{ display: 'flex', marginBottom: 12 }}>
        <button
          onClick={() => setMapProvider('amap')}
          style={{
            flex: 1,
            padding: '5px 0',
            border: '1px solid',
            borderRadius: '4px 0 0 4px',
            borderColor: mapProvider === 'amap' ? '#1a73e8' : '#ccc',
            background: mapProvider === 'amap' ? '#1a73e8' : '#fff',
            color: mapProvider === 'amap' ? '#fff' : '#555',
            cursor: 'pointer',
            fontSize: 12,
          }}
        >
          高德
        </button>
        <button
          onClick={() => setMapProvider('maplibre')}
          disabled={!hasMapTilerKey}
          title={hasMapTilerKey ? 'MapTiler 地形图' : '未配置 MapTiler API Key'}
          style={{
            flex: 1,
            padding: '5px 0',
            border: '1px solid',
            borderRadius: '0 4px 4px 0',
            borderColor: mapProvider === 'maplibre' ? '#1a73e8' : '#ccc',
            background: mapProvider === 'maplibre' ? '#1a73e8' : '#fff',
            color: !hasMapTilerKey ? '#ccc' : mapProvider === 'maplibre' ? '#fff' : '#555',
            cursor: hasMapTilerKey ? 'pointer' : 'not-allowed',
            fontSize: 12,
          }}
        >
          地形
        </button>
      </div>

      {/* AMap sub-settings */}
      {mapProvider === 'amap' && (
        <>
          <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>地图类型</div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, cursor: 'pointer', fontSize: 12 }}>
            <input
              type="radio"
              name="amapType"
              checked={amapMapType === 'satellite'}
              onChange={() => setAmapMapType('satellite')}
            />
            卫星地图
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, cursor: 'pointer', fontSize: 12 }}>
            <input
              type="radio"
              name="amapType"
              checked={amapMapType === 'normal'}
              onChange={() => setAmapMapType('normal')}
            />
            普通地图
          </label>

          {amapMapType === 'satellite' && (
            <>
              <div style={{ borderTop: '1px solid #eee', marginBottom: 8 }} />
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 12 }}>
                <input
                  type="checkbox"
                  checked={amapShowRoadNet}
                  onChange={(e) => setAmapShowRoadNet(e.target.checked)}
                />
                显示路网标注
              </label>
            </>
          )}
        </>
      )}

      {mapProvider === 'maplibre' && (
        <>
          {/* Style selection */}
          <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>地图风格</div>
          <select
            value={maplibreStyle}
            onChange={(e) => setMaplibreStyle(e.target.value)}
            style={{
              width: '100%',
              padding: '4px 6px',
              fontSize: 12,
              borderRadius: 4,
              border: '1px solid #ccc',
              marginBottom: 4,
            }}
          >
            {STYLE_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label} — {opt.desc}
              </option>
            ))}
          </select>

          {/* Style description */}
          <div style={{ fontSize: 11, color: '#999', marginBottom: 10 }}>
            {STYLE_OPTIONS.find((o) => o.id === maplibreStyle)?.desc}
          </div>

          <div style={{ borderTop: '1px solid #eee', marginBottom: 8 }} />

          {/* 3D Terrain toggle */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, cursor: 'pointer', fontSize: 12 }}>
            <input
              type="checkbox"
              checked={terrainEnabled}
              onChange={(e) => setTerrainEnabled(e.target.checked)}
            />
            3D 地形 (DEM)
          </label>

          {/* Contour overlay toggle */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, cursor: 'pointer', fontSize: 12 }}>
            <input
              type="checkbox"
              checked={showContours}
              onChange={(e) => setShowContours(e.target.checked)}
            />
            叠加等高线
          </label>

          {/* Pitch slider */}
          <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
            倾斜角度: {maplibrePitch}°
          </div>
          <input
            type="range"
            min={0}
            max={60}
            step={1}
            value={maplibrePitch}
            onChange={(e) => setMaplibrePitch(Number(e.target.value))}
            style={{ width: '100%', marginBottom: 8 }}
          />
        </>
      )}
    </div>
  );
}
