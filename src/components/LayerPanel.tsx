import { useState } from 'react';
import { useMapStore } from '../store/useMapStore';
import { LAYER_BACKGROUNDS } from '../types';
import { ExportButton } from './ExportButton';

export function LayerPanel() {
  const layers = useMapStore((s) => s.layers);
  const activeLayerId = useMapStore((s) => s.activeLayerId);
  const addLayer = useMapStore((s) => s.addLayer);
  const removeLayer = useMapStore((s) => s.removeLayer);
  const setActiveLayer = useMapStore((s) => s.setActiveLayer);
  const toggleLayerVisibility = useMapStore((s) => s.toggleLayerVisibility);
  const renameLayer = useMapStore((s) => s.renameLayer);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);

  const startRename = (id: string, name: string) => {
    setEditingId(id);
    setEditName(name);
  };

  const commitRename = (id: string) => {
    if (editName.trim()) {
      renameLayer(id, editName.trim());
    }
    setEditingId(null);
  };

  const handleAddLayer = (bg: string) => {
    const bgLabel = LAYER_BACKGROUNDS.find((b) => b.value === bg)?.label || '';
    const name = `图层 ${layers.length + 1}${bg !== 'transparent' ? ` (${bgLabel})` : ''}`;
    addLayer(name, bg);
    setShowColorPicker(false);
  };

  return (
    <div style={{
      position: 'absolute',
      top: 72,
      right: 12,
      zIndex: 100,
      background: '#fff',
      borderRadius: 8,
      boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
      width: 220,
      padding: 12,
      fontSize: 13,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <strong>图层</strong>
        <button
          onClick={() => setShowColorPicker(true)}
          style={{
            border: 'none',
            background: '#1a73e8',
            color: '#fff',
            borderRadius: 4,
            padding: '2px 10px',
            cursor: 'pointer',
            fontSize: 16,
            lineHeight: '24px',
          }}
        >
          +
        </button>
      </div>

      {layers.length === 0 && (
        <div style={{ color: '#999', fontSize: 12, textAlign: 'center', padding: 12 }}>
          暂无图层，点击 + 创建
        </div>
      )}

      {layers.map((layer) => (
        <div
          key={layer.id}
          onClick={() => setActiveLayer(layer.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 4px',
            borderRadius: 4,
            marginBottom: 2,
            cursor: 'pointer',
            background: layer.id === activeLayerId ? '#e8f0fe' : 'transparent',
            border: layer.id === activeLayerId ? '1px solid #1a73e8' : '1px solid transparent',
          }}
        >
          {/* Background color swatch */}
          <div style={{
            width: 12,
            height: 12,
            borderRadius: 2,
            border: '1px solid #ddd',
            flexShrink: 0,
            background: layer.backgroundColor === 'transparent'
              ? 'repeating-conic-gradient(#eee 0% 25%, transparent 0% 50%) 50% / 6px 6px'
              : layer.backgroundColor,
          }} />

          {/* Visibility toggle */}
          <button
            onClick={(e) => { e.stopPropagation(); toggleLayerVisibility(layer.id); }}
            title={layer.visible ? '隐藏' : '显示'}
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: 16,
              padding: 0,
              lineHeight: 1,
              color: layer.visible ? '#333' : '#ccc',
            }}
          >
            {layer.visible ? '👁' : '◌'}
          </button>

          {/* Layer name */}
          {editingId === layer.id ? (
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={() => commitRename(layer.id)}
              onKeyDown={(e) => { if (e.key === 'Enter') commitRename(layer.id); }}
              onClick={(e) => e.stopPropagation()}
              autoFocus
              style={{
                flex: 1,
                border: '1px solid #1a73e8',
                borderRadius: 2,
                padding: '1px 4px',
                fontSize: 12,
                outline: 'none',
              }}
            />
          ) : (
            <span
              onDoubleClick={() => startRename(layer.id, layer.name)}
              style={{
                flex: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontSize: 12,
              }}
            >
              {layer.name}
            </span>
          )}

          {/* Element count */}
          <span style={{ fontSize: 10, color: '#999' }}>
            {layer.elements.length}
          </span>

          {/* Delete */}
          <button
            onClick={(e) => { e.stopPropagation(); removeLayer(layer.id); }}
            title="删除图层"
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: '#999',
              fontSize: 14,
              padding: 0,
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>
      ))}

      {layers.length > 0 && (
        <div style={{ marginTop: 8, borderTop: '1px solid #eee', paddingTop: 8 }}>
          <ExportButton />
        </div>
      )}

      {/* Color picker dialog */}
      {showColorPicker && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setShowColorPicker(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 999,
            }}
          />
          {/* Dialog */}
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: 4,
            background: '#fff',
            borderRadius: 8,
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            padding: 12,
            zIndex: 1000,
          }}>
            <div style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 8, color: '#333' }}>
              选择图层背景色
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 6,
            }}>
              {LAYER_BACKGROUNDS.map((bg) => (
                <button
                  key={bg.value}
                  onClick={() => handleAddLayer(bg.value)}
                  title={bg.label}
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: 6,
                    background: bg.value === 'transparent'
                      ? 'repeating-conic-gradient(#eee 0% 25%, transparent 0% 50%) 50% / 6px 6px'
                      : bg.value,
                    height: 40,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    color: bg.value === 'transparent' ? '#999' : '#333',
                    fontWeight: bg.value === 'transparent' ? 'bold' : 'normal',
                  }}
                >
                  {bg.value === 'transparent' ? '透明' : bg.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
