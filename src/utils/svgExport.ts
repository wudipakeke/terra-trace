import type { DrawingElement, TracingProject, ExportOptions } from '../types';
import { DEFAULT_EXPORT_OPTIONS } from '../types';
import { getAllTerrainPatternDefs, getTerrainPatternId } from './terrainPatterns';

// ── Smooth path (catmull-rom → cubic bezier), same as DrawingOverlay ──
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

function getBounds(elements: DrawingElement[]): {
  minLat: number; maxLat: number; minLng: number; maxLng: number;
} | null {
  let minLat = Infinity, maxLat = -Infinity;
  let minLng = Infinity, maxLng = -Infinity;
  let found = false;
  for (const el of elements) {
    for (const p of el.points) {
      if (p.lat < minLat) minLat = p.lat;
      if (p.lat > maxLat) maxLat = p.lat;
      if (p.lng < minLng) minLng = p.lng;
      if (p.lng > maxLng) maxLng = p.lng;
      found = true;
    }
  }
  return found ? { minLat, maxLat, minLng, maxLng } : null;
}

function latLngToSvg(
  lat: number, lng: number,
  bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number },
  svgW: number, svgH: number, padding: number,
): { x: number; y: number } {
  const latRange = bounds.maxLat - bounds.minLat || 1;
  const lngRange = bounds.maxLng - bounds.minLng || 1;
  return {
    x: padding + ((lng - bounds.minLng) / lngRange) * (svgW - 2 * padding),
    y: padding + ((bounds.maxLat - lat) / latRange) * (svgH - 2 * padding),
  };
}

function elementToSvgPath(
  el: DrawingElement,
  bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number },
  svgW: number, svgH: number, padding: number,
): string {
  const pts = el.points.map((p) => latLngToSvg(p.lat, p.lng, bounds, svgW, svgH, padding));
  const s = el.style;
  if (pts.length === 0) return '';
  const indent = '  ';

  switch (el.type) {
    case 'path': {
      if (pts.length < 2) return '';
      const d = smoothPathData(pts);
      return `${indent}<path d="${escapeXml(d)}" fill="none" stroke="${s.color}" stroke-width="${s.width}" stroke-linecap="round" stroke-linejoin="round"${s.opacity !== undefined ? ` opacity="${s.opacity}"` : ''} />`;
    }
    case 'terrain-fill': {
      if (pts.length < 3) return '';
      const d = smoothPathData(pts) + ' Z';
      const patternId = getTerrainPatternId(el.terrainType || 'mountains');
      return `${indent}<path d="${escapeXml(d)}" fill="url(#${patternId})" fill-opacity="${s.opacity ?? 0.7}" stroke="none" />`;
    }
    case 'territory-fill': {
      if (pts.length < 3) return '';
      const d = smoothPathData(pts) + ' Z';
      const color = s.color || '#C23A2B';
      return `${indent}<path d="${escapeXml(d)}" fill="${color}" fill-opacity="${s.opacity ?? 0.25}" stroke="${color}" stroke-width="1.5" stroke-opacity="0.6" stroke-linejoin="round" />`;
    }
    case 'icon': {
      const p = pts[0];
      return `${indent}<text x="${p.x}" y="${p.y}" text-anchor="middle" dominant-baseline="central" font-size="28">${escapeXml(el.icon || '📍')}</text>`;
    }
    case 'text': {
      const p = pts[0];
      return `${indent}<text x="${p.x}" y="${p.y}" fill="${s.color}" font-size="${s.width > 4 ? s.width : 16}" font-weight="bold">${escapeXml(el.text || '')}</text>`;
    }
    default:
      return '';
  }
}

/** Rice paper background SVG */
function ricePaperBg(svgW: number, svgH: number): string {
  return `<rect x="0" y="0" width="${svgW}" height="${svgH}" fill="#F5F0E8" />
  <path d="M10 20 Q50 18 90 22 Q130 26 180 20" fill="none" stroke="#E8E0D0" stroke-width="0.5" stroke-opacity="0.4" />
  <path d="M5 60 Q60 55 120 62 Q160 67 195 58" fill="none" stroke="#EDE5D5" stroke-width="0.4" stroke-opacity="0.35" />
  <path d="M20 100 Q80 96 140 102 Q170 106 190 98" fill="none" stroke="#E8E0D0" stroke-width="0.6" stroke-opacity="0.3" />
  <path d="M0 140 Q40 137 100 142 Q150 147 200 138" fill="none" stroke="#EDE5D5" stroke-width="0.4" stroke-opacity="0.35" />
  <path d="M15 170 Q70 168 130 172 Q175 176 200 168" fill="none" stroke="#E8E0D0" stroke-width="0.5" stroke-opacity="0.3" />
  <path d="M30 0 Q28 40 32 80 Q36 130 28 180" fill="none" stroke="#EDE5D5" stroke-width="0.3" stroke-opacity="0.3" />
  <path d="M80 5 Q78 45 82 95 Q85 145 80 195" fill="none" stroke="#E8E0D0" stroke-width="0.4" stroke-opacity="0.25" />
  <path d="M140 0 Q138 50 142 100 Q145 160 140 200" fill="none" stroke="#EDE5D5" stroke-width="0.3" stroke-opacity="0.3" />
  <circle cx="45" cy="55" r="1" fill="#D0C8B8" fill-opacity="0.4" />
  <circle cx="130" cy="90" r="0.8" fill="#D0C8B8" fill-opacity="0.35" />
  <circle cx="170" cy="150" r="1.2" fill="#D0C8B8" fill-opacity="0.3" />
  <circle cx="25" cy="140" r="0.7" fill="#D0C8B8" fill-opacity="0.35" />
  <circle cx="90" cy="170" r="1" fill="#D0C8B8" fill-opacity="0.3" />`;
}

/** Map border decoration as SVG fragment */
function mapBorderSvg(svgW: number, svgH: number, padding: number): string {
  const inset = padding;
  const lines: string[] = [];
  // outer border
  lines.push(`<rect x="${inset}" y="${inset}" width="${svgW - inset * 2}" height="${svgH - inset * 2}" fill="none" stroke="#555" stroke-width="2" stroke-opacity="0.5" />`);
  lines.push(`<rect x="${inset - 4}" y="${inset - 4}" width="${svgW - inset * 2 + 8}" height="${svgH - inset * 2 + 8}" fill="none" stroke="#999" stroke-width="0.5" stroke-opacity="0.35" />`);
  // corner fret marks
  const fret = (x: number, y: number, rot: number) =>
    `<g transform="translate(${x},${y}) rotate(${rot})" fill="none" stroke="#555" stroke-width="1.2" stroke-opacity="0.45"><polyline points="0 0 0 -16 -16 -16 -16 0 -8 0 -8 -8 0 -8" /></g>`;
  lines.push(fret(inset - 6, inset - 6, 0));
  lines.push(fret(svgW - inset + 6, inset - 6, 90));
  lines.push(fret(svgW - inset + 6, svgH - inset + 6, 180));
  lines.push(fret(inset - 6, svgH - inset + 6, 270));
  return lines.join('\n  ');
}

export function exportProjectAsSvg(
  project: TracingProject,
  options: ExportOptions = DEFAULT_EXPORT_OPTIONS,
): string {
  const { elements, name } = project;
  if (elements.length === 0) return '';

  const bounds = getBounds(elements);
  if (!bounds) return '';

  const baseW = 2000;
  const baseH = 1500;
  const scale = options.scale || 2;
  const svgW = baseW * scale / 2;
  const svgH = baseH * scale / 2;
  const padding = 40;

  const latMargin = (bounds.maxLat - bounds.minLat) * 0.05 || 0.01;
  const lngMargin = (bounds.maxLng - bounds.minLng) * 0.05 || 0.01;
  const exportBounds = {
    minLat: bounds.minLat - latMargin,
    maxLat: bounds.maxLat + latMargin,
    minLng: bounds.minLng - lngMargin,
    maxLng: bounds.maxLng + lngMargin,
  };

  const parts: string[] = [];

  // Background
  if (options.includeBackground) {
    parts.push(ricePaperBg(svgW, svgH));
  }

  // Map border
  if (options.includeBorder) {
    parts.push(mapBorderSvg(svgW, svgH, padding));
  }

  // Elements
  const paths = elements
    .map((el) => elementToSvgPath(el, exportBounds, svgW, svgH, padding))
    .filter((s) => s.length > 0)
    .join('\n');

  const hasTerrain = elements.some((e) => e.type === 'terrain-fill');
  const defsSvg = hasTerrain ? getAllTerrainPatternDefs() : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}">
  <title>${escapeXml(name)}</title>
  <desc>Xianxia world map — created with map tracing tool</desc>
${defsSvg ? `  ${defsSvg}` : ''}
  ${parts.join('\n  ')}
${paths}
</svg>`;
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function downloadSvg(svgContent: string, filename: string): void {
  const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
