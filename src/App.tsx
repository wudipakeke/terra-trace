import { useEffect, useState } from 'react';
import { MapContainer } from './components/MapContainer';
import { Toolbar } from './components/Toolbar';
import { LayerPanel } from './components/LayerPanel';
import { MapSettings } from './components/MapSettings';
import { ZoomControl } from './components/ZoomControl';
import { useMapStore } from './store/useMapStore';
import type { ToolType } from './types';

const toolKeys: Record<string, ToolType> = {
  '1': 'pen',
  '2': 'highlighter',
  '3': 'eraser',
  '4': 'icon',
  '5': 'text',
};

function KeyboardHandler() {
  const undo = useMapStore((s) => s.undo);
  const setActiveTool = useMapStore((s) => s.setActiveTool);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        return;
      }

      if (e.key === 'Escape') {
        setActiveTool('select');
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        undo();
      }
      // Number shortcuts for tools
      const tool = toolKeys[e.key];
      if (tool) {
        setActiveTool(tool);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [undo, setActiveTool]);

  return null;
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', fontFamily: 'system-ui, sans-serif' }}>
      <MapContainer />
      <Toolbar />

      {/* Toggle button */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          title="打开侧边栏"
          style={{
            position: 'absolute',
            top: 80,
            left: 12,
            zIndex: 100,
            width: 36,
            height: 36,
            border: 'none',
            borderRadius: 8,
            background: '#fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            cursor: 'pointer',
            fontSize: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#333',
          }}
        >
          ☰
        </button>
      )}

      {/* Sidebar */}
      {sidebarOpen && (
        <div style={{
          position: 'absolute',
          top: 80,
          left: 12,
          zIndex: 100,
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 8,
            boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
            padding: '8px 0 0 0',
            width: 180,
            position: 'relative',
          }}>
            <button
              onClick={() => setSidebarOpen(false)}
              title="关闭侧边栏"
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
                width: 24,
                height: 24,
                border: 'none',
                borderRadius: 4,
                background: 'transparent',
                cursor: 'pointer',
                fontSize: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#999',
              }}
            >
              ✕
            </button>
            <div style={{ padding: '0 12px 8px 12px' }}>
              <MapSettings />
            </div>
          </div>
        </div>
      )}

      <LayerPanel />
      <ZoomControl />
      <KeyboardHandler />
    </div>
  );
}
