import { useMapStore } from '../store/useMapStore';
import { TERRAIN_DEFS } from '../types';
import { getTerrainPatternId } from '../utils/terrainPatterns';

interface TerrainBrushProps {
  compact?: boolean;
}

export function TerrainBrush({ compact }: TerrainBrushProps) {
  const selectedTerrainType = useMapStore((s) => s.selectedTerrainType);
  const setSelectedTerrainType = useMapStore((s) => s.setSelectedTerrainType);
  const terrainBrushSize = useMapStore((s) => s.terrainBrushSize);
  const setTerrainBrushSize = useMapStore((s) => s.setTerrainBrushSize);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        padding: '6px 10px',
      }}
    >
      <div style={{ display: 'flex', gap: 4, flexWrap: compact ? 'nowrap' : 'wrap', justifyContent: 'center' }}>
        {TERRAIN_DEFS.map((td) => {
          const patternId = getTerrainPatternId(td.type);
          const isActive = selectedTerrainType === td.type;
          return (
            <button
              key={td.type}
              title={td.labelZh}
              onClick={() => setSelectedTerrainType(td.type)}
              style={{
                width: 44,
                height: 44,
                borderRadius: 8,
                border: isActive ? '3px solid #1a73e8' : '2px solid #e0e0e0',
                background: isActive ? '#f0f7ff' : '#fafafa',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                padding: 2,
              }}
            >
              <svg width="28" height="28" viewBox="0 0 28 28">
                <defs>
                  <pattern
                    id={`${patternId}-thumb`}
                    width="20"
                    height="20"
                    patternUnits="userSpaceOnUse"
                    patternTransform="scale(0.6)"
                  >
                    <use href={`#${patternId}`} />
                  </pattern>
                </defs>
                <rect width="28" height="28" fill={`url(#${patternId}-thumb)`} rx="2" />
              </svg>
              <span style={{ fontSize: 9, color: '#666', lineHeight: 1 }}>{td.labelZh}</span>
            </button>
          );
        })}
      </div>
      {!compact && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <label style={{ fontSize: 11, color: '#888' }}>笔刷大小</label>
          <input
            type="range"
            min={5}
            max={40}
            value={terrainBrushSize}
            onChange={(e) => setTerrainBrushSize(Number(e.target.value))}
            style={{ width: 80 }}
          />
          <span style={{ fontSize: 11, color: '#999', minWidth: 20 }}>{terrainBrushSize}px</span>
        </div>
      )}
    </div>
  );
}
