import type { DrawingElement, Layer, Point } from '../types';

function getBounds(elements: DrawingElement[]): {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
} | null {
  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;
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
  lat: number,
  lng: number,
  bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number },
  svgW: number,
  svgH: number,
  padding: number
): { x: number; y: number } {
  const latRange = bounds.maxLat - bounds.minLat || 1;
  const lngRange = bounds.maxLng - bounds.minLng || 1;
  const x = padding + ((lng - bounds.minLng) / lngRange) * (svgW - 2 * padding);
  const y = padding + ((bounds.maxLat - lat) / latRange) * (svgH - 2 * padding);
  return { x, y };
}

function elementToSvgPath(
  el: DrawingElement,
  bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number },
  svgW: number,
  svgH: number,
  padding: number
): string {
  const pts = el.points.map((p) => latLngToSvg(p.lat, p.lng, bounds, svgW, svgH, padding));
  const s = el.style;
  if (pts.length === 0) return '';

  switch (el.type) {
    case 'path': {
      if (pts.length < 2) return '';
      const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`).join(' ');
      return `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="${s.width}" stroke-linecap="round" stroke-linejoin="round"${s.opacity !== undefined ? ` opacity="${s.opacity}"` : ''} />`;
    }
    case 'icon': {
      const p = pts[0];
      return `<text x="${p.x}" y="${p.y}" text-anchor="middle" dominant-baseline="central" font-size="28">${escapeXml(el.icon || '📍')}</text>`;
    }
    case 'text': {
      const p = pts[0];
      return `<text x="${p.x}" y="${p.y}" fill="${s.color}" font-size="${s.width > 4 ? s.width : 16}" font-weight="bold">${escapeXml(el.text || '')}</text>`;
    }
    // Backward compatibility with old types
    case 'marker':
    case 'freehand':
    case 'line':
    case 'rectangle':
    case 'circle':
    case 'polygon':
      return renderLegacyElementToSvg(el, pts);
    default:
      return '';
  }
}

function renderLegacyElementToSvg(
  el: DrawingElement,
  pts: { x: number; y: number }[]
): string {
  const s = el.style;
  if (pts.length === 0) return '';

  switch (el.type) {
    case 'marker': {
      if (pts.length === 0) return '';
      const p = pts[0];
      const label = el.label || '📍';
      return (
        `<circle cx="${p.x}" cy="${p.y}" r="8" fill="${s.color}" stroke="#fff" stroke-width="2" />\n` +
        `  <text x="${p.x}" y="${p.y - 14}" text-anchor="middle" fill="${s.color}" font-size="14" font-weight="bold">${escapeXml(label)}</text>`
      );
    }
    case 'freehand':
    case 'line': {
      if (pts.length < 2) return '';
      const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`).join(' ');
      return `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="${s.width}" stroke-linecap="round" stroke-linejoin="round" />`;
    }
    case 'rectangle': {
      if (pts.length < 2) return '';
      const [a, b] = [pts[0], pts[pts.length - 1]];
      const x = Math.min(a.x, b.x);
      const y = Math.min(a.y, b.y);
      const w = Math.abs(b.x - a.x);
      const h = Math.abs(b.y - a.y);
      return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${s.color}" fill-opacity="0.3" stroke="${s.color}" stroke-width="${s.width}" />`;
    }
    case 'circle': {
      if (pts.length < 2) return '';
      const [c, edge] = [pts[0], pts[pts.length - 1]];
      const r = Math.sqrt((edge.x - c.x) ** 2 + (edge.y - c.y) ** 2);
      return `<circle cx="${c.x}" cy="${c.y}" r="${r}" fill="${s.color}" fill-opacity="0.3" stroke="${s.color}" stroke-width="${s.width}" />`;
    }
    case 'polygon': {
      if (pts.length < 3) return '';
      const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`).join(' ') + ' Z';
      return `<path d="${d}" fill="${s.color}" fill-opacity="0.3" stroke="${s.color}" stroke-width="${s.width}" stroke-linejoin="round" />`;
    }
    default:
      return '';
  }
}

export function exportLayerAsSvg(layer: Layer): string {
  const { elements, name, backgroundColor } = layer;
  if (elements.length === 0) return '';

  const bounds = getBounds(elements);
  if (!bounds) return '';

  const svgW = 2000;
  const svgH = 1500;
  const padding = 40;

  // Add a bit of margin to bounds
  const latMargin = (bounds.maxLat - bounds.minLat) * 0.05 || 0.01;
  const lngMargin = (bounds.maxLng - bounds.minLng) * 0.05 || 0.01;
  const exportBounds = {
    minLat: bounds.minLat - latMargin,
    maxLat: bounds.maxLat + latMargin,
    minLng: bounds.minLng - lngMargin,
    maxLng: bounds.maxLng + lngMargin,
  };

  // Background rect (if not transparent)
  let bgSvg = '';
  if (backgroundColor !== 'transparent') {
    bgSvg = `  <rect x="0" y="0" width="${svgW}" height="${svgH}" fill="${backgroundColor}" />\n`;
  }

  const paths = elements
    .map((el) => '  ' + elementToSvgPath(el, exportBounds, svgW, svgH, padding))
    .filter((s) => s.length > 0)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}">
  <title>${escapeXml(name)}</title>
  <desc>Map drawing layer exported as vector graphics</desc>
${bgSvg}${paths}
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
