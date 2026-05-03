import { useEffect, useRef, useState, useCallback } from 'react';
import { useMapStore } from '../store/useMapStore';
import { getAdapter } from '../utils/mapAdapter';
import type { DrawingElement } from '../types';

function renderElementSvg(adapter: ReturnType<typeof getAdapter>, map: any, el: DrawingElement): JSX.Element | null {
  const pts = el.points.map((p) => adapter.latLngToPixel(map, p.lat, p.lng));
  const s = el.style;
  if (pts.length === 0) return null;

  switch (el.type) {
    case 'path': {
      if (pts.length < 2) return null;
      const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`).join(' ');
      return (
        <path
          key={el.id}
          d={d}
          fill="none"
          stroke={s.color}
          strokeWidth={s.width}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={s.opacity ?? 1}
        />
      );
    }
    case 'icon': {
      const p = pts[0];
      return (
        <text
          key={el.id}
          x={p.x}
          y={p.y}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={28}
          style={{ cursor: 'default', userSelect: 'none' }}
        >
          {el.icon || '📍'}
        </text>
      );
    }
    case 'text': {
      const p = pts[0];
      return (
        <text
          key={el.id}
          x={p.x}
          y={p.y}
          textAnchor="start"
          dominantBaseline="hanging"
          fill={s.color}
          fontSize={s.width > 4 ? s.width : 16}
          fontWeight="bold"
          style={{ cursor: 'default', userSelect: 'none' }}
        >
          {el.text || ''}
        </text>
      );
    }
    // Backward compatibility with old element types
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
      const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`).join(' ');
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
      const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`).join(' ') + ' Z';
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
  threshold: number
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
  const mapProvider = useMapStore((s) => s.mapProvider);
  const layers = useMapStore((s) => s.layers);
  const activeLayerId = useMapStore((s) => s.activeLayerId);
  const activeTool = useMapStore((s) => s.activeTool);
  const addElement = useMapStore((s) => s.addElement);
  const removeElement = useMapStore((s) => s.removeElement);

  // Pen styles
  const strokeColor = useMapStore((s) => s.strokeColor);
  const strokeWidth = useMapStore((s) => s.strokeWidth);

  // Highlighter styles
  const highlighterColor = useMapStore((s) => s.highlighterColor);
  const highlighterWidth = useMapStore((s) => s.highlighterWidth);
  const highlighterOpacity = useMapStore((s) => s.highlighterOpacity);

  // Eraser
  const eraserSize = useMapStore((s) => s.eraserSize);

  // Icon
  const selectedIcon = useMapStore((s) => s.selectedIcon);

  const [size, setSize] = useState({ w: 0, h: 0 });
  const [tick, setTick] = useState(0);
  const drawingRef = useRef(false);
  const pointsRef = useRef<{ lat: number; lng: number }[]>([]);
  const [textInput, setTextInput] = useState<TextInputState | null>(null);

  const adapter = getAdapter(mapProvider);

  // Sync with map view changes
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
    if (activeTool === 'select' || !activeLayerId || !map) return;
    const pt = getEventPoint(e);
    const ll = adapter.pixelToLatLng(map, pt.x, pt.y);

    // Eraser: click to delete nearest element
    if (activeTool === 'eraser') {
      const activeEls = layers.find((l) => l.id === activeLayerId)?.elements || [];
      const nearestId = findNearestElement(activeEls, pt.x, pt.y, adapter, map, eraserSize);
      if (nearestId) {
        removeElement(nearestId);
      }
      return;
    }

    // Icon: place icon marker
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

    // Text: show text input at click location
    if (activeTool === 'text') {
      setTextInput({ x: pt.x, y: pt.y, lat: ll.lat, lng: ll.lng });
      return;
    }

    // Pen or Highlighter: start freehand drawing
    drawingRef.current = true;
    pointsRef.current = [ll];
  }, [activeTool, activeLayerId, map, layers, addElement, removeElement, strokeColor, strokeWidth, selectedIcon, eraserSize, getEventPoint, adapter]);

  const handleMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!map) return;
    const pt = getEventPoint(e);

    if (!drawingRef.current) return;
    const ll = adapter.pixelToLatLng(map, pt.x, pt.y);
    if (activeTool === 'pen' || activeTool === 'highlighter') {
      pointsRef.current = [...pointsRef.current, ll];
    } else {
      pointsRef.current = [pointsRef.current[0], ll];
    }
    setTick((n) => n + 1);
  }, [map, activeTool, activeLayerId, layers, adapter, getEventPoint, eraserSize]);

  const handleUp = useCallback(() => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    const pts = pointsRef.current;
    if (pts.length < 2) return;

    const isHighlighter = activeTool === 'highlighter';
    const color = isHighlighter ? highlighterColor : strokeColor;
    const width = isHighlighter ? highlighterWidth : strokeWidth;
    const opacity = isHighlighter ? highlighterOpacity : undefined;

    addElement({
      id: `el_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type: 'path',
      points: pts,
      style: { color, width, opacity },
    });

    pointsRef.current = [];
    setTick((n) => n + 1);
  }, [activeTool, addElement, strokeColor, strokeWidth, highlighterColor, highlighterWidth, highlighterOpacity]);

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

  const previewEl =
    drawingRef.current && pointsRef.current.length >= 1 && map
      ? renderElementSvg(adapter, map, {
          id: '__preview__',
          type: 'path',
          points: pointsRef.current,
          style: {
            color: activeTool === 'highlighter' ? highlighterColor : strokeColor,
            width: activeTool === 'highlighter' ? highlighterWidth : strokeWidth,
            opacity: activeTool === 'highlighter' ? highlighterOpacity : undefined,
          },
        })
      : null;

  const visibleLayers = layers.filter((l) => l.visible);

  const interactive = activeTool !== 'select' && activeLayerId !== null;

  if (!map) return null;

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
        {/* Each visible layer = its background + its elements, stacked in order */}
        {visibleLayers.map((layer) => (
          <g key={layer.id}>
            {layer.backgroundColor !== 'transparent' && (
              <rect x={0} y={0} width="100%" height="100%" fill={layer.backgroundColor} pointerEvents="none" />
            )}
            {layer.elements.map((el) => renderElementSvg(adapter, map, el))}
          </g>
        ))}

        {/* In-progress drawing preview */}
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
