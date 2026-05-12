import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useMapStore } from '../store/useMapStore';
import { DrawingOverlay } from './DrawingOverlay';

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_API_KEY || '';
const MAP_STYLE = 'outdoor';

function addContourLayers(map: maplibregl.Map) {
  if (map.getSource('contours')) return;

  map.addSource('contours', {
    type: 'vector',
    url: `https://api.maptiler.com/tiles/contours/tiles.json?key=${MAPTILER_KEY}`,
  });

  const layers = map.getStyle().layers;
  const firstSymbol = layers?.find((l) => l.type === 'symbol');
  const beforeId = firstSymbol?.id;

  map.addLayer(
    {
      id: 'contour-lines-minor',
      type: 'line',
      source: 'contours',
      'source-layer': 'contour',
      filter: ['!=', ['%', ['get', 'index'], 5], 0],
      paint: {
        'line-color': '#6b4c3b',
        'line-width': 0.6,
        'line-opacity': 0.3,
      },
    },
    beforeId,
  );

  map.addLayer(
    {
      id: 'contour-lines-major',
      type: 'line',
      source: 'contours',
      'source-layer': 'contour',
      filter: ['==', ['%', ['get', 'index'], 5], 0],
      paint: {
        'line-color': '#5c3317',
        'line-width': 1.2,
        'line-opacity': 0.5,
      },
    },
    beforeId,
  );

  map.addLayer(
    {
      id: 'contour-labels',
      type: 'symbol',
      source: 'contours',
      'source-layer': 'contour',
      filter: ['==', ['%', ['get', 'index'], 5], 0],
      layout: {
        'text-field': ['to-string', ['get', 'ele']],
        'text-size': 9,
      },
      paint: {
        'text-color': '#5c3317',
        'text-opacity': 0.6,
        'text-halo-color': '#fff',
        'text-halo-width': 2,
      },
    },
    beforeId,
  );
}

function removeContourLayers(map: maplibregl.Map) {
  for (const id of ['contour-labels', 'contour-lines-major', 'contour-lines-minor']) {
    try {
      if (map.getLayer(id)) map.removeLayer(id);
    } catch {}
  }
  try {
    if (map.getSource('contours')) map.removeSource('contours');
  } catch {}
}

export function MapContainer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const maplibreRef = useRef<maplibregl.Map | null>(null);

  const showContours = useMapStore((s) => s.showContours);
  const showMapView = useMapStore((s) => s.showMapView);
  const mapOpacity = useMapStore((s) => s.mapOpacity);
  const setMap = useMapStore((s) => s.setMap);
  const storedMap = useMapStore((s) => s.map);

  // Initialize MapLibre map (once)
  useEffect(() => {
    const div = containerRef.current;
    if (!div || maplibreRef.current) return;

    const viewport = useMapStore.getState().mapViewport;
    const m = new maplibregl.Map({
      container: div,
      style: `https://api.maptiler.com/maps/${MAP_STYLE}/style.json?key=${MAPTILER_KEY}`,
      center: [viewport.center.lng, viewport.center.lat],
      zoom: viewport.zoom,
      pitch: 0,
      bearing: 0,
    });
    maplibreRef.current = m;

    m.addControl(new maplibregl.NavigationControl(), 'bottom-right');

    m.on('load', () => {
      // Switch to Chinese labels where available
      const styleLayers = m.getStyle().layers;
      for (const layer of styleLayers) {
        const layout = layer.layout as Record<string, any> | undefined;
        const tf: unknown = layout?.['text-field'];
        if (tf && typeof tf === 'string' && (tf as string).includes('{name:')) {
          try {
            m.setLayoutProperty(layer.id, 'text-field', [
              'case',
              ['!=', ['get', 'name:zh-Hans'], ''],
              ['get', 'name:zh-Hans'],
              ['get', 'name:latin'],
            ]);
          } catch {}
        }
      }

      if (useMapStore.getState().showContours) {
        addContourLayers(m);
      }

      // Persist viewport
      m.on('moveend', () => {
        const c = m.getCenter();
        useMapStore.getState().setMapViewport({
          center: { lat: c.lat, lng: c.lng },
          zoom: m.getZoom(),
        });
      });

      setMap(m);
    });

    m.on('error', (e) => {
      console.error('MapLibre error:', e.error?.message || e);
    });

    return () => {
      try { m.remove(); } catch {}
      maplibreRef.current = null;
      setMap(null);
    };
  }, [setMap]);

  // Contour toggle on existing map
  useEffect(() => {
    if (!storedMap) return;
    try {
      if (showContours) {
        addContourLayers(storedMap);
      } else {
        removeContourLayers(storedMap);
      }
    } catch {}
  }, [showContours, storedMap]);

  // Map opacity
  useEffect(() => {
    if (!storedMap) return;
    const container = storedMap.getContainer();
    if (container) {
      container.style.opacity = String(mapOpacity);
    }
  }, [mapOpacity, storedMap]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: showMapView ? 1 : 0,
          transition: 'opacity 0.3s ease',
          pointerEvents: showMapView ? 'auto' : 'none',
        }}
      >
        <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
        {!storedMap && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            background: '#f5f0e8', color: '#999', fontSize: 14,
          }}>
            加载地图中...
          </div>
        )}
      </div>
      <DrawingOverlay />
    </div>
  );
}
