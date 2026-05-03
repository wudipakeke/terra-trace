import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useMapStore } from '../store/useMapStore';
import { DrawingOverlay } from './DrawingOverlay';

const AMAP_KEY = import.meta.env.VITE_AMAP_API_KEY || '';
const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_API_KEY || '';

function addContourLayers(map: maplibregl.Map) {
  if (map.getSource('contours')) return;

  map.addSource('contours', {
    type: 'vector',
    url: `https://api.maptiler.com/tiles/contours/tiles.json?key=${MAPTILER_KEY}`,
  });

  const layers = map.getStyle().layers;
  const firstSymbol = layers?.find((l) => l.type === 'symbol');
  const beforeId = firstSymbol?.id;

  // Minor contours (every non-5th)
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

  // Major contours (every 5th, with elevation label)
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

  const mapProvider = useMapStore((s) => s.mapProvider);
  const amapMapType = useMapStore((s) => s.amapMapType);
  const amapShowRoadNet = useMapStore((s) => s.amapShowRoadNet);
  const maplibreStyle = useMapStore((s) => s.maplibreStyle);
  const terrainEnabled = useMapStore((s) => s.terrainEnabled);
  const maplibrePitch = useMapStore((s) => s.maplibrePitch);
  const showContours = useMapStore((s) => s.showContours);
  const setMap = useMapStore((s) => s.setMap);
  const initKey = useRef(0);
  const maplibreRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    const div = containerRef.current;
    if (!div) return;

    const key = ++initKey.current;
    setMap(null);

    // Cleanup previous MapLibre instance
    if (maplibreRef.current) {
      maplibreRef.current.remove();
      maplibreRef.current = null;
    }

    div.innerHTML = '';

    if (mapProvider === 'amap') {
      if (!AMAP_KEY) return;
      const script = document.createElement('script');
      script.src = `https://webapi.amap.com/maps?v=2.0&key=${AMAP_KEY}`;
      script.async = true;
      script.onload = () => {
        if (initKey.current !== key || !containerRef.current) return;

        if (amapMapType === 'satellite') {
          const layers: any[] = [new AMap.TileLayer.Satellite()];
          if (amapShowRoadNet) {
            layers.push(new AMap.TileLayer.RoadNet());
          }
          const m = new AMap.Map(containerRef.current, {
            center: [116.397428, 39.90923],
            zoom: 12,
            layers,
            viewMode: '3D',
            pitch: 0,
          });
          setMap(m);
        } else {
          const m = new AMap.Map(containerRef.current, {
            center: [116.397428, 39.90923],
            zoom: 12,
            viewMode: '2D',
          });
          setMap(m);
        }
      };
      document.head.appendChild(script);
    } else {
      // MapLibre GL JS with MapTiler
      if (!MAPTILER_KEY) return;

      const m = new maplibregl.Map({
        container: containerRef.current,
        style: `https://api.maptiler.com/maps/${maplibreStyle}/style.json?key=${MAPTILER_KEY}`,
        center: [116.397428, 39.90923],
        zoom: 12,
        pitch: 0,
        bearing: 0,
      });
      maplibreRef.current = m;

      m.addControl(new maplibregl.NavigationControl(), 'bottom-right');

      m.on('load', () => {
        if (initKey.current !== key) return;

        // Add DEM source for 3D terrain
        if (!m.getSource('terrain-source')) {
          try {
            m.addSource('terrain-source', {
              type: 'raster-dem',
              url: `https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json?key=${MAPTILER_KEY}`,
              tileSize: 256,
            });
          } catch {}
        }

        // Apply terrain and pitch settings
        if (terrainEnabled) {
          try {
            m.setTerrain({ source: 'terrain-source', exaggeration: 1.5 });
          } catch {}
        }
        if (maplibrePitch > 0) {
          m.setPitch(maplibrePitch);
        }

        // Switch text layers to prefer Chinese labels
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

        // Add contour overlay if enabled
        if (showContours) {
          addContourLayers(m);
        }

        setMap(m);
      });

      m.on('error', (e) => {
        console.error('MapLibre error:', e.error?.message || e);
      });
    }
  }, [mapProvider, amapMapType, amapShowRoadNet, maplibreStyle, setMap]);

  // Live updates for terrain/pitch on existing MapLibre map
  useEffect(() => {
    const m = maplibreRef.current;
    if (!m || mapProvider !== 'maplibre') return;

    if (!m.getSource('terrain-source')) {
      try {
        m.addSource('terrain-source', {
          type: 'raster-dem',
          url: `https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json?key=${MAPTILER_KEY}`,
          tileSize: 256,
        });
      } catch {}
    }

    if (terrainEnabled) {
      try {
        m.setTerrain({ source: 'terrain-source', exaggeration: 1.5 });
      } catch {}
    } else {
      try {
        m.setTerrain(null);
      } catch {}
    }

    m.setPitch(maplibrePitch);
  }, [terrainEnabled, maplibrePitch, mapProvider]);

  // Live toggle for contour overlay
  useEffect(() => {
    const m = maplibreRef.current;
    if (!m || mapProvider !== 'maplibre') return;

    if (showContours) {
      addContourLayers(m);
    } else {
      removeContourLayers(m);
    }
  }, [showContours, mapProvider]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      <DrawingOverlay />
    </div>
  );
}
