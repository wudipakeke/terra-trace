import { useMapStore } from '../store/useMapStore';
import { TERRAIN_DEFS } from '../types';

export function ElementsPanel() {
  const projects = useMapStore((s) => s.projects);
  const currentProjectId = useMapStore((s) => s.currentProjectId);
  const removeElement = useMapStore((s) => s.removeElement);

  const project = projects.find((p) => p.id === currentProjectId);
  if (!project) return null;

  const elements = project.elements;

  return (
    <div
      style={{
        position: 'absolute',
        top: 80,
        right: 12,
        zIndex: 100,
        background: '#fff',
        borderRadius: 8,
        boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
        padding: 10,
        width: 180,
        maxHeight: 'calc(100vh - 200px)',
        overflowY: 'auto',
        fontSize: 13,
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 8, color: '#333' }}>
        项目信息
      </div>
      <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
        <div>地图类型: MapTiler Outdoor</div>
        <div>元素数: {elements.length}</div>
      </div>
      <div style={{ fontWeight: 600, marginBottom: 6, color: '#333', borderTop: '1px solid #eee', paddingTop: 8 }}>
        元素列表
      </div>
      {elements.length === 0 && (
        <div style={{ fontSize: 12, color: '#999', fontStyle: 'italic' }}>
          暂无元素，开始绘制吧
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {[...elements].reverse().map((el, i) => {
          const terrainDef = el.terrainType
            ? TERRAIN_DEFS.find((t) => t.type === el.terrainType)
            : null;
          return (
            <div
              key={el.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '3px 6px',
                borderRadius: 4,
                background: i % 2 === 0 ? '#fafafa' : '#fff',
                gap: 4,
              }}
            >
              <span style={{ fontSize: 11, color: '#555', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                {terrainDef ? `🌋 ${terrainDef.labelZh}` : el.type === 'path' ? '✏️ 路径' : el.type === 'terrain-fill' ? '🌋 地形' : el.type === 'icon' ? `📍 ${el.icon}` : el.type === 'text' ? `📝 ${el.text?.slice(0, 8)}` : `📄 ${el.type}`}
              </span>
              <button
                onClick={() => removeElement(el.id)}
                title="删除"
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: '#999',
                  cursor: 'pointer',
                  fontSize: 12,
                  padding: '0 2px',
                  lineHeight: 1,
                }}
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
