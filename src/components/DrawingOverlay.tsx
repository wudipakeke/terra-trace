import { useEffect, useRef, useState, useCallback } from 'react';
import { useMapStore } from '../store/useMapStore';
import { getAdapter } from '../utils/mapAdapter';
import { getTerrainPatternId } from '../utils/terrainPatterns';
import { PatternDefs } from './PatternDefs';
import { MapBorder } from './MapBorder';
import type { DrawingElement, TerrainType } from '../types';

// ── Smooth path from Catmull-Rom → cubic Bezier ──
function smoothPathData(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return '';
  if (pts.length === 2) return `M${pts[0].x} ${pts[0].y}L${pts[1].x} ${pts[1].y}`;

  let d = `M${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += `C${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

// ── Line-segment intersection test ──
function segmentsIntersect(
  ax: number, ay: number, bx: number, by: number,
  cx: number, cy: number, dx: number, dy: number,
): boolean {
  const d1x = bx - ax, d1y = by - ay;
  const d2x = dx - cx, d2y = dy - cy;
  const denom = d1x * d2y - d1y * d2x;
  if (Math.abs(denom) < 1e-10) return false;
  const t = ((cx - ax) * d2y - (cy - ay) * d2x) / denom;
  const u = ((cx - ax) * d1y - (cy - ay) * d1x) / denom;
  return t >= 0 && t <= 1 && u >= 0 && u <= 1;
}

function cutLineIntersectsPath(
  cutStart: { x: number; y: number },
  cutEnd: { x: number; y: number },
  pathPts: { x: number; y: number }[],
): boolean {
  for (let i = 0; i < pathPts.length - 1; i++) {
    if (segmentsIntersect(
      cutStart.x, cutStart.y, cutEnd.x, cutEnd.y,
      pathPts[i].x, pathPts[i].y, pathPts[i + 1].x, pathPts[i + 1].y,
    )) return true;
  }
  return false;
}

// ── Line width scaling ──
function scaleLineWidth(screenWidth: number, zoom: number, mode: 'screen' | 'map'): number {
  if (mode === 'screen') return screenWidth;
  // At zoom 12, 1 screen px ≈ 1 map unit. Each zoom level doubles/halves.
  return screenWidth * Math.pow(2, zoom - 12);
}

// ── Rice paper SVG pattern (shared singleton) ──
const RICE_PAPER_ID = 'rice-paper-bg';
const RICE_PAPER_PATTERN = (
  <defs>
    <pattern id={RICE_PAPER_ID} width="200" height="200" patternUnits="userSpaceOnUse">
      {/* Base paper colour */}
      <rect width="200" height="200" fill="#F5F0E8" />
      {/* Fibre texture — fine lines */}
      <path d="M10 20 Q50 18 90 22 Q130 26 180 20" fill="none" stroke="#E8E0D0" strokeWidth="0.5" strokeOpacity="0.4" />
      <path d="M5 60 Q60 55 120 62 Q160 67 195 58" fill="none" stroke="#EDE5D5" strokeWidth="0.4" strokeOpacity="0.35" />
      <path d="M20 100 Q80 96 140 102 Q170 106 190 98" fill="none" stroke="#E8E0D0" strokeWidth="0.6" strokeOpacity="0.3" />
      <path d="M0 140 Q40 137 100 142 Q150 147 200 138" fill="none" stroke="#EDE5D5" strokeWidth="0.4" strokeOpacity="0.35" />
      <path d="M15 170 Q70 168 130 172 Q175 176 200 168" fill="none" stroke="#E8E0D0" strokeWidth="0.5" strokeOpacity="0.3" />
      {/* Fibre texture — crossing whispers */}
      <path d="M30 0 Q28 40 32 80 Q36 130 28 180" fill="none" stroke="#EDE5D5" strokeWidth="0.3" strokeOpacity="0.3" />
      <path d="M80 5 Q78 45 82 95 Q85 145 80 195" fill="none" stroke="#E8E0D0" strokeWidth="0.4" strokeOpacity="0.25" />
      <path d="M140 0 Q138 50 142 100 Q145 160 140 200" fill="none" stroke="#EDE5D5" strokeWidth="0.3" strokeOpacity="0.3" />
      {/* Tiny dark specks (natural paper impurities) */}
      <circle cx="45" cy="55" r="1" fill="#D0C8B8" fillOpacity="0.4" />
      <circle cx="130" cy="90" r="0.8" fill="#D0C8B8" fillOpacity="0.35" />
      <circle cx="170" cy="150" r="1.2" fill="#D0C8B8" fillOpacity="0.3" />
      <circle cx="25" cy="140" r="0.7" fill="#D0C8B8" fillOpacity="0.35" />
      <circle cx="90" cy="170" r="1" fill="#D0C8B8" fillOpacity="0.3" />
    </pattern>
  </defs>
);

// ── rendering helpers ──

function renderElementSvg(
  adapter: ReturnType<typeof getAdapter>,
  map: any,
  el: DrawingElement,
  zoom: number,
  lineWidthMode: 'screen' | 'map',
): JSX.Element | null {
  try {
    const pts = el.points.map((p) => adapter.latLngToPixel(map, p.lat, p.lng));
    const s = el.style;
    if (pts.length === 0) return null;

    switch (el.type) {
      case 'path': {
        if (pts.length < 2) return null;
        const d = smoothPathData(pts);
        const w = scaleLineWidth(s.width, zoom, lineWidthMode);
        return (
          <path
            key={el.id}
            d={d}
            fill="none"
            stroke={s.color}
            strokeWidth={w}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={s.opacity ?? 1}
          />
        );
      }
      case 'icon': {
        const p = pts[0];
        const iconSize = scaleLineWidth(s.width || 28, zoom, lineWidthMode);
        return (
          <text
            key={el.id}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={Math.max(14, iconSize)}
            style={{ cursor: 'default', userSelect: 'none' }}
          >
            {el.icon || '📍'}
          </text>
        );
      }
      case 'text': {
        const p = pts[0];
        const fontSize = scaleLineWidth(s.width > 4 ? s.width : 16, zoom, lineWidthMode);
        return (
          <text
            key={el.id}
            x={p.x}
            y={p.y}
            textAnchor="start"
            dominantBaseline="hanging"
            fill={s.color}
            fontSize={Math.max(10, fontSize)}
            fontWeight="bold"
            style={{ cursor: 'default', userSelect: 'none' }}
          >
            {el.text || ''}
          </text>
        );
      }
      case 'terrain-fill': {
        if (pts.length < 3) return null;
        const d = smoothPathData(pts) + ' Z';
        const patternId = getTerrainPatternId(el.terrainType || 'mountains');
        return (
          <path
            key={el.id}
            d={d}
            fill={`url(#${patternId})`}
            fillOpacity={s.opacity ?? 0.7}
            stroke="none"
          />
        );
      }
      case 'territory-fill': {
        if (pts.length < 3) return null;
        const d = smoothPathData(pts) + ' Z';
        const color = s.color || '#C23A2B';
        return (
          <path
            key={el.id}
            d={d}
            fill={color}
            fillOpacity={s.opacity ?? 0.25}
            stroke={color}
            strokeWidth={1.5}
            strokeOpacity={0.6}
            strokeLinejoin="round"
          />
        );
      }
      // backward compatibility
      case 'marker':
      case 'freehand':
      case 'line':
      case 'rectangle':
      case 'circle':
      case 'polygon':
        return renderLegacyElement(el, pts);
      default:
        return null;
    }
  } catch {
    return null;
  }
}

function renderLegacyElement(el: DrawingElement, pts: { x: number; y: number }[]): JSX.Element | null {
  const s = el.style;
  if (pts.length === 0) return null;

  switch (el.type) {
    case 'marker': {
      const p = pts[0];
      return (
        <g key={el.id}>
          <circle cx={p.x} cy={p.y} r={8} fill={s.color} stroke="#fff" strokeWidth={2} />
          <text x={p.x} y={p.y - 14} textAnchor="middle" fill={s.color} fontSize={14} fontWeight="bold">
            {el.label || '📍'}
          </text>
        </g>
      );
    }
    case 'freehand':
    case 'line': {
      if (pts.length < 2) return null;
      const d = smoothPathData(pts);
      return <path key={el.id} d={d} fill="none" stroke={s.color} strokeWidth={s.width} strokeLinecap="round" strokeLinejoin="round" />;
    }
    case 'rectangle': {
      if (pts.length < 2) return null;
      const [a, b] = [pts[0], pts[pts.length - 1]];
      return (
        <rect
          key={el.id}
          x={Math.min(a.x, b.x)} y={Math.min(a.y, b.y)}
          width={Math.abs(b.x - a.x)} height={Math.abs(b.y - a.y)}
          fill={s.fillColor || s.color} fillOpacity={s.opacity ?? 0.3}
          stroke={s.color} strokeWidth={s.width}
        />
      );
    }
    case 'circle': {
      if (pts.length < 2) return null;
      const [c, edge] = [pts[0], pts[pts.length - 1]];
      const r = Math.sqrt((edge.x - c.x) ** 2 + (edge.y - c.y) ** 2);
      return (
        <circle
          key={el.id} cx={c.x} cy={c.y} r={r}
          fill={s.fillColor || s.color} fillOpacity={s.opacity ?? 0.3}
          stroke={s.color} strokeWidth={s.width}
        />
      );
    }
    case 'polygon': {
      if (pts.length < 3) return null;
      const d = smoothPathData(pts) + ' Z';
      return <path key={el.id} d={d} fill={s.fillColor || s.color} fillOpacity={s.opacity ?? 0.3} stroke={s.color} strokeWidth={s.width} strokeLinejoin="round" />;
    }
    default:
      return null;
  }
}

function findNearestElement(
  elements: DrawingElement[],
  cx: number,
  cy: number,
  adapter: ReturnType<typeof getAdapter>,
  map: any,
  threshold: number,
): string | null {
  let minDist = Infinity;
  let nearestId: string | null = null;

  for (const el of elements) {
    for (const pt of el.points) {
      const pixel = adapter.latLngToPixel(map, pt.lat, pt.lng);
      const dist = Math.hypot(pixel.x - cx, pixel.y - cy);
      if (dist < minDist) {
        minDist = dist;
        nearestId = el.id;
      }
    }
  }

  return minDist < threshold ? nearestId : null;
}

interface TextInputState {
  x: number;
  y: number;
  lat: number;
  lng: number;
}

export function DrawingOverlay() {
  const map = useMapStore((s) => s.map);
  const projects = useMapStore((s) => s.projects);
  const currentProjectId = useMapStore((s) => s.currentProjectId);
  const activeTool = useMapStore((s) => s.activeTool);
  const addElement = useMapStore((s) => s.addElement);
  const removeElement = useMapStore((s) => s.removeElement);
  const mapViewport = useMapStore((s) => s.mapViewport);
  const mapOpacity = useMapStore((s) => s.mapOpacity);
  const showBorder = useMapStore((s) => s.showBorder);
  const lineWidthMode = useMapStore((s) => s.lineWidthMode);

  // Unified brush state
  const brushMode = useMapStore((s) => s.brushMode);
  const strokeColor = useMapStore((s) => s.strokeColor);
  const strokeWidth = useMapStore((s) => s.strokeWidth);

  // Highlighter
  const highlighterColor = useMapStore((s) => s.highlighterColor);
  const highlighterWidth = useMapStore((s) => s.highlighterWidth);
  const highlighterOpacity = useMapStore((s) => s.highlighterOpacity);

  // Eraser
  const eraserSize = useMapStore((s) => s.eraserSize);
  const eraserMode = useMapStore((s) => s.eraserMode);

  // Icon
  const selectedIcon = useMapStore((s) => s.selectedIcon);

  // Terrain
  const selectedTerrainType = useMapStore((s) => s.selectedTerrainType);

  // Territory
  const territoryColor = useMapStore((s) => s.territoryColor);

  const project = projects.find((p) => p.id === currentProjectId);
  const elements = project?.elements ?? [];
  const backgroundColor = project?.backgroundColor ?? 'transparent';

  const [size, setSize] = useState({ w: 0, h: 0 });
  const [tick, setTick] = useState(0);
  const drawingRef = useRef(false);
  const pointsRef = useRef<{ lat: number; lng: number }[]>([]);
  const [textInput, setTextInput] = useState<TextInputState | null>(null);

  // Cut-eraser state
  const cutStartRef = useRef<{ x: number; y: number } | null>(null);
  const cutEndRef = useRef<{ x: number; y: number } | null>(null);

  // Zoom for line-width scaling
  const zoom = mapViewport.zoom;

  const adapter = getAdapter();

  // Sync size with map container
  useEffect(() => {
    if (!map) return;
    const div = adapter.getContainer(map);
    let rafId: number;

    const update = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        setSize({ w: div.clientWidth, h: div.clientHeight });
        setTick((n) => n + 1);
      });
    };
    update();

    try {
      map.on?.('mapmove', update);
      map.on?.('move', update);
      map.on?.('moveend', update);
      map.on?.('zoomend', update);
      map.on?.('resize', update);
    } catch {}

    try {
      map.addListener?.('bounds_changed', update);
      map.addListener?.('center_changed', update);
      map.addListener?.('zoom_changed', update);
    } catch {}

    window.addEventListener('resize', update);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', update);
    };
  }, [map, adapter]);

  const getEventPoint = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent<SVGSVGElement>) => {
    if (!map) return;
    e.preventDefault();
    const dir = e.deltaY > 0 ? -1 : 1;
    const z = map.getZoom();
    try {
      if (dir > 0) {
        map.zoomIn ? map.zoomIn() : map.setZoom(Math.min(z + 1, 21));
      } else {
        map.zoomOut ? map.zoomOut() : map.setZoom(Math.max(z - 1, 1));
      }
    } catch {}
  }, [map]);

  const handleDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (activeTool === 'select' || !currentProjectId || !map) return;
    const pt = getEventPoint(e);
    const ll = adapter.pixelToLatLng(map, pt.x, pt.y);

    // Eraser: click-delete or cut mode
    if (activeTool === 'eraser') {
      if (eraserMode === 'cut') {
        // Cut mode: record start of cut line
        cutStartRef.current = pt;
        cutEndRef.current = null;
        drawingRef.current = true;
        return;
      }
      // Click-delete: remove nearest element
      const nearestId = findNearestElement(elements, pt.x, pt.y, adapter, map, eraserSize);
      if (nearestId) {
        removeElement(nearestId);
      }
      return;
    }

    // Text: show input
    if (activeTool === 'text') {
      setTextInput({ x: pt.x, y: pt.y, lat: ll.lat, lng: ll.lng });
      return;
    }

    // Icon: place marker
    if (activeTool === 'icon') {
      addElement({
        id: `el_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        type: 'icon',
        points: [ll],
        style: { color: strokeColor, width: 28 },
        icon: selectedIcon,
      });
      return;
    }

    // Unified brush: pen or texture
    drawingRef.current = true;
    pointsRef.current = [ll];
  }, [activeTool, currentProjectId, map, elements, eraserMode, eraserSize, addElement, removeElement,
      strokeColor, selectedIcon, getEventPoint, adapter]);

  const handleMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!map || !drawingRef.current) return;
    const pt = getEventPoint(e);
    const ll = adapter.pixelToLatLng(map, pt.x, pt.y);

    if (activeTool === 'eraser' && eraserMode === 'cut') {
      cutEndRef.current = pt;
      setTick((n) => n + 1);
      return;
    }

    if (activeTool === 'pen' || activeTool === 'highlighter' || activeTool === 'terrain' || activeTool === 'territory') {
      pointsRef.current = [...pointsRef.current, ll];
    } else {
      pointsRef.current = [pointsRef.current[0], ll];
    }
    setTick((n) => n + 1);
  }, [map, activeTool, eraserMode, adapter, getEventPoint]);

  const handleUp = useCallback(() => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    const pts = pointsRef.current;

    // Cut eraser: check cut line against all elements
    if (activeTool === 'eraser' && eraserMode === 'cut') {
      const cutStart = cutStartRef.current;
      const cutEnd = cutEndRef.current;
      if (cutStart && cutEnd && project && map) {
        const toRemove: string[] = [];
        for (const el of project.elements) {
          const screenPts = el.points.map((p) => adapter.latLngToPixel(map, p.lat, p.lng));
          if (cutLineIntersectsPath(cutStart, cutEnd, screenPts)) {
            toRemove.push(el.id);
          }
        }
        for (const id of toRemove) {
          removeElement(id);
        }
      }
      cutStartRef.current = null;
      cutEndRef.current = null;
      return;
    }

    if (pts.length < 2) return;

    // Territory tool
    if (activeTool === 'territory') {
      addElement({
        id: `el_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        type: 'territory-fill',
        points: pts,
        style: { color: territoryColor, width: 1.5, opacity: 0.25 },
      });
      pointsRef.current = [];
      setTick((n) => n + 1);
      return;
    }

    // Terrain tool (texture mode)
    if (activeTool === 'terrain') {
      addElement({
        id: `el_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        type: 'terrain-fill',
        points: pts,
        style: { color: '#000', width: 0, opacity: 0.7 },
        terrainType: selectedTerrainType,
      });
      pointsRef.current = [];
      setTick((n) => n + 1);
      return;
    }

    // Pen / Highlighter
    if (activeTool === 'pen' || activeTool === 'highlighter') {
      const isHighlighter = activeTool === 'highlighter';
      // If brushMode === 'texture', draw terrain-fill instead
      if (brushMode === 'texture') {
        addElement({
          id: `el_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          type: 'terrain-fill',
          points: pts,
          style: { color: '#000', width: 0, opacity: 0.7 },
          terrainType: selectedTerrainType,
        });
      } else {
        const color = isHighlighter ? highlighterColor : strokeColor;
        const width = isHighlighter ? highlighterWidth : strokeWidth;
        const opacity = isHighlighter ? highlighterOpacity : undefined;

        addElement({
          id: `el_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          type: 'path',
          points: pts,
          style: { color, width, opacity },
        });
      }
    }

    pointsRef.current = [];
    setTick((n) => n + 1);
  }, [activeTool, brushMode, selectedTerrainType, territoryColor, addElement, removeElement,
      strokeColor, strokeWidth, highlighterColor, highlighterWidth, highlighterOpacity,
      project, map, adapter, eraserMode]);

  const handleTextSubmit = useCallback((text: string) => {
    if (!textInput || !text.trim()) {
      setTextInput(null);
      return;
    }
    addElement({
      id: `el_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type: 'text',
      points: [{ lat: textInput.lat, lng: textInput.lng }],
      style: { color: strokeColor, width: 16 },
      text: text.trim(),
    });
    setTextInput(null);
  }, [textInput, addElement, strokeColor]);

  // Build preview element (in-progress drawing)
  const previewEl = (() => {
    if (!drawingRef.current) return null;

    if (activeTool === 'eraser' && eraserMode === 'cut' && cutStartRef.current && cutEndRef.current) {
      // Show cut line preview
      return (
        <line
          key="__cut_preview__"
          x1={cutStartRef.current.x}
          y1={cutStartRef.current.y}
          x2={cutEndRef.current.x}
          y2={cutEndRef.current.y}
          stroke="#e53935"
          strokeWidth={2}
          strokeDasharray="4 3"
          strokeLinecap="round"
        />
      );
    }

    if (!map) return null;
    const pts = pointsRef.current;
    if (pts.length < 1) return null;

    try {
      const mappedPts = pts.map((p) => adapter.latLngToPixel(map, p.lat, p.lng));

      if (activeTool === 'terrain' || (activeTool === 'pen' && brushMode === 'texture')) {
        if (mappedPts.length < 2) return null;
        const d = smoothPathData(mappedPts) + ' Z';
        const patternId = getTerrainPatternId(selectedTerrainType);
        return (
          <path
            key="__terrain_preview__"
            d={d}
            fill={`url(#${patternId})`}
            fillOpacity={0.5}
            stroke="#666"
            strokeWidth={1}
            strokeDasharray="4 3"
          />
        );
      }

      if (activeTool === 'territory') {
        if (mappedPts.length < 2) return null;
        const d = smoothPathData(mappedPts) + ' Z';
        return (
          <path
            key="__territory_preview__"
            d={d}
            fill={territoryColor}
            fillOpacity={0.2}
            stroke={territoryColor}
            strokeWidth={1.5}
            strokeDasharray="4 3"
            strokeLinejoin="round"
          />
        );
      }

      // Pen / Highlighter preview
      if (mappedPts.length < 2) return null;
      const isHighlighter = activeTool === 'highlighter';
      const color = isHighlighter ? highlighterColor : strokeColor;
      const width = isHighlighter ? highlighterWidth : strokeWidth;
      const opacity = isHighlighter ? highlighterOpacity : undefined;
      const d = smoothPathData(mappedPts);
      return (
        <path
          key="__preview__"
          d={d}
          fill="none"
          stroke={color}
          strokeWidth={width}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={opacity}
        />
      );
    } catch {
      return null;
    }
  })();

  const interactive = activeTool !== 'select' && currentProjectId !== null;

  if (!map) return null;

  const showRicePaper = backgroundColor === 'transparent' || mapOpacity < 0.05;

  return (
    <>
      <svg
        width={size.w}
        height={size.h}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: interactive ? 'auto' : 'none',
          cursor: activeTool === 'eraser' ? 'pointer'
            : interactive ? 'crosshair' : 'inherit',
          zIndex: 10,
        }}
        onMouseDown={handleDown}
        onMouseMove={handleMove}
        onMouseUp={handleUp}
        onMouseLeave={handleUp}
        onWheel={handleWheel}
      >
        {/* Rice paper texture background */}
        {showRicePaper && RICE_PAPER_PATTERN}
        {showRicePaper && (
          <rect x={0} y={0} width="100%" height="100%" fill={`url(#${RICE_PAPER_ID})`} pointerEvents="none" />
        )}

        {/* Pattern definitions for terrain fills */}
        <PatternDefs />

        {/* Project elements */}
        {project && (
          <g>
            {backgroundColor !== 'transparent' && !showRicePaper && (
              <rect x={0} y={0} width="100%" height="100%" fill={backgroundColor} pointerEvents="none" />
            )}
            {elements.map((el) => renderElementSvg(adapter, map, el, zoom, lineWidthMode))}
          </g>
        )}

        {/* Map border decoration */}
        {showBorder && (
          <MapBorder width={size.w} height={size.h} />
        )}

        {/* Cut eraser preview */}
        {previewEl}
      </svg>

      {/* Text input popup */}
      {textInput && (
        <div
          style={{
            position: 'absolute',
            left: textInput.x,
            top: textInput.y - 30,
            zIndex: 50,
          }}
        >
          <input
            autoFocus
            type="text"
            placeholder="输入文字..."
            style={{
              border: '2px solid #1a73e8',
              borderRadius: 4,
              padding: '4px 8px',
              fontSize: 14,
              outline: 'none',
              minWidth: 120,
              background: '#fff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleTextSubmit((e.target as HTMLInputElement).value);
              }
              if (e.key === 'Escape') {
                setTextInput(null);
              }
              e.stopPropagation();
            }}
            onBlur={(e) => handleTextSubmit(e.target.value)}
          />
        </div>
      )}
    </>
  );
}
