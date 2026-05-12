import { useMemo } from 'react';

interface MapBorderProps {
  width: number;
  height: number;
  padding?: number;
}

/** Classical Chinese map border with fret (回纹) corner decorations */
export function MapBorder({ width, height, padding = 24 }: MapBorderProps) {
  const inset = padding;

  // Only render if we have reasonable dimensions
  if (width < 100 || height < 100) return null;

  const borderWidth = 2;
  const cornerSize = 28;

  return (
    <g pointerEvents="none">
      {/* Outer border line */}
      <rect
        x={inset - borderWidth}
        y={inset - borderWidth}
        width={width - inset * 2 + borderWidth * 2}
        height={height - inset * 2 + borderWidth * 2}
        fill="none"
        stroke="#555"
        strokeWidth={borderWidth}
        strokeOpacity={0.5}
      />

      {/* Inner border line */}
      <rect
        x={inset - borderWidth - 4}
        y={inset - borderWidth - 4}
        width={width - inset * 2 + borderWidth * 2 + 8}
        height={height - inset * 2 + borderWidth * 2 + 8}
        fill="none"
        stroke="#999"
        strokeWidth={0.5}
        strokeOpacity={0.35}
      />

      {/* Corner decorations — fret (回纹) style */}
      {/* Top-left */}
      <CornerFret x={inset - 6} y={inset - 6} rotation={0} />
      {/* Top-right */}
      <CornerFret x={width - inset + 6} y={inset - 6} rotation={90} />
      {/* Bottom-right */}
      <CornerFret x={width - inset + 6} y={height - inset + 6} rotation={180} />
      {/* Bottom-left */}
      <CornerFret x={inset - 6} y={height - inset + 6} rotation={270} />
    </g>
  );
}

/** Fret (回纹) corner ornament — traditional Chinese geometric pattern */
function CornerFret({ x, y, rotation }: { x: number; y: number; rotation: number }) {
  const size = 16;
  const half = size / 2;

  const d = useMemo(() => {
    // Build a simple fret/spiral pattern
    const pts: [number, number][] = [];
    // Outer square
    pts.push([0, 0]);
    pts.push([0, -size]);
    pts.push([-size, -size]);
    pts.push([-size, 0]);
    // Inner spiral
    pts.push([-size + half, 0]);
    pts.push([-size + half, -size + half]);
    pts.push([-half, -size + half]);
    return pts.map(([px, py]) => `${px} ${py}`).join(' ');
  }, []);

  return (
    <g
      transform={`translate(${x}, ${y}) rotate(${rotation})`}
      fill="none"
      stroke="#555"
      strokeWidth={1.2}
      strokeOpacity={0.45}
    >
      <polyline points={d} fill="none" />
    </g>
  );
}
