import { useEffect, useState } from 'react';
import { useMapStore } from '../store/useMapStore';
import { MapContainer } from '../components/MapContainer';
import { Toolbar } from '../components/Toolbar';
import { ElementsPanel } from '../components/ElementsPanel';
import { ZoomControl } from '../components/ZoomControl';
import { ExportButton } from '../components/ExportButton';
import { BackgroundColorPicker } from '../components/BackgroundColorPicker';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { MapSettings } from '../components/MapSettings';
import type { ToolType } from '../types';

const toolKeys: Record<string, ToolType> = {
  '1': 'pen',
  '2': 'highlighter',
  '3': 'eraser',
  '4': 'icon',
  '5': 'text',
  '6': 'terrain',
  '7': 'territory',
};

function KeyboardHandler() {
  const undo = useMapStore((s) => s.undo);
  const redo = useMapStore((s) => s.redo);
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
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') {
        e.preventDefault();
        redo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        undo();
      }
      const tool = toolKeys[e.key];
      if (tool) {
        setActiveTool(tool);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [undo, redo, setActiveTool]);

  return null;
}

export function EditorPage() {
  const projects = useMapStore((s) => s.projects);
  const currentProjectId = useMapStore((s) => s.currentProjectId);
  const updateProject = useMapStore((s) => s.updateProject);
  const closeProject = useMapStore((s) => s.closeProject);
  const showMapView = useMapStore((s) => s.showMapView);
  const setShowMapView = useMapStore((s) => s.setShowMapView);
  const mapOpacity = useMapStore((s) => s.mapOpacity);
  const setMapOpacity = useMapStore((s) => s.setMapOpacity);

  const project = projects.find((p) => p.id === currentProjectId);
  const [showSettings, setShowSettings] = useState(false);

  if (!project) {
    closeProject();
    return null;
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', fontFamily: 'system-ui, sans-serif' }}>
      {/* Top bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 200,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 14px',
          background: '#fff',
          boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
        }}
      >
        <button
          onClick={closeProject}
          title="返回项目列表"
          style={{
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            fontSize: 18,
            color: '#555',
            padding: '4px 8px',
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          ← <span style={{ fontSize: 13 }}>返回</span>
        </button>

        <div style={{ width: 1, height: 24, background: '#e0e0e0' }} />

        {/* Project name */}
        <div style={{ fontSize: 15, fontWeight: 600, color: '#333' }}>
          {project.name}
        </div>

        {/* Map type badge */}
        <span style={{ fontSize: 11, background: '#f0f0f0', color: '#666', padding: '2px 8px', borderRadius: 4 }}>
          MapTiler Outdoor
        </span>

        <div style={{ flex: 1 }} />

        {/* Background color */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 12, color: '#888' }}>背景:</span>
          <BackgroundColorPicker
            value={project.backgroundColor}
            onChange={(color) => updateProject(project.id, { backgroundColor: color })}
          />
        </div>

        <div style={{ width: 1, height: 24, background: '#e0e0e0' }} />

        {/* Map toggle */}
        <button
          onClick={() => setShowMapView(!showMapView)}
          title={showMapView ? '隐藏地图' : '显示地图'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 6,
            border: '1px solid #ddd',
            background: showMapView ? '#e8f0fe' : '#fff',
            cursor: 'pointer',
            fontSize: 13,
            color: showMapView ? '#1a73e8' : '#555',
            fontWeight: showMapView ? 500 : 400,
          }}
        >
          <span style={{ fontSize: 16 }}>{showMapView ? '👁️' : '👁️‍🗨️'}</span>
          {showMapView ? '隐藏底图' : '显示底图'}
        </button>

        {/* Map opacity slider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 11, color: '#888', whiteSpace: 'nowrap' }}>底图:</span>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(mapOpacity * 100)}
            onChange={(e) => setMapOpacity(Number(e.target.value) / 100)}
            style={{ width: 60, margin: 0, verticalAlign: 'middle' }}
            title={`底图透明度: ${Math.round(mapOpacity * 100)}%`}
          />
        </div>

        {/* Export */}
        <ExportButton />

        {/* Map Settings toggle */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowSettings(!showSettings)}
            title="地图设置"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 10px',
              borderRadius: 6,
              border: '1px solid #ddd',
              background: showSettings ? '#e8f0fe' : '#fff',
              cursor: 'pointer',
              fontSize: 16,
              color: showSettings ? '#1a73e8' : '#555',
            }}
          >
            ⚙️
          </button>
          {showSettings && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 299 }} onClick={() => setShowSettings(false)} />
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 4px)',
                  right: 0,
                  zIndex: 300,
                  background: '#fff',
                  borderRadius: 8,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                  padding: 16,
                  width: 220,
                }}
              >
                <MapSettings />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Map & Drawing */}
      <ErrorBoundary>
        <MapContainer />
      </ErrorBoundary>
      <ElementsPanel />
      <Toolbar />
      <ZoomControl />
      <KeyboardHandler />
    </div>
  );
}
