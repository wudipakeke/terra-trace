import type { TerrainType } from '../types';

export function getTerrainPatternId(type: TerrainType): string {
  return `terrain-${type}`;
}

export function getTerrainPatternSvg(type: TerrainType, indent = '    '): string {
  const config = PATTERN_CONFIGS[type];
  if (!config) return '';
  const { id, width, height, content } = config;
  return `${indent}<pattern id="${id}" width="${width}" height="${height}" patternUnits="userSpaceOnUse" patternTransform="scale(0.8)">
${content.split('\n').map(l => indent + '  ' + l).join('\n')}
${indent}</pattern>`;
}

export function getAllTerrainPatternDefs(indent = '    '): string {
  const defs = (Object.keys(PATTERN_CONFIGS) as TerrainType[])
    .map(t => getTerrainPatternSvg(t, indent))
    .join('\n');
  return `${indent}<defs>\n${defs}\n${indent}</defs>`;
}

interface PatternConfig {
  id: string;
  width: number;
  height: number;
  content: string; // SVG markup inside pattern
}

/**
 * Ink-wash (水墨) style terrain patterns.
 * Uses the traditional "墨分五色" (five hues of ink) system:
 *   焦 (coke black #1a1a1a), 浓 (thick #333), 重 (heavy #555),
 *   淡 (light #999), 清 (clear #ccc)
 * Plus red seal ink (#C23A2B) for occasional accent marks.
 */
const PATTERN_CONFIGS: Record<TerrainType, PatternConfig> = {
  // 山脉 — Mountain: "斧劈皴" ax-cut stroke style
  mountains: {
    id: 'terrain-mountains',
    width: 48,
    height: 48,
    content: `<rect width="48" height="48" fill="#f5f0e8" />
<path d="M0 44 L4 28 L10 44" fill="#333" fill-opacity="0.35" stroke="none" />
<path d="M4 44 L10 18 L16 44" fill="#555" fill-opacity="0.25" stroke="none" />
<path d="M10 44 L16 10 L24 44" fill="none" stroke="#1a1a1a" stroke-width="0.8" stroke-opacity="0.5" />
<path d="M16 44 L22 14 L30 44" fill="#555" fill-opacity="0.3" stroke="none" />
<path d="M22 44 L28 22 L36 44" fill="#333" fill-opacity="0.25" stroke="none" />
<path d="M28 44 L34 16 L42 44" fill="#999" fill-opacity="0.2" stroke="none" />
<path d="M34 44 L40 28 L48 44" fill="#555" fill-opacity="0.2" stroke="none" />
<!-- ink wash shading strokes -->
<path d="M12 22 Q14 24 16 22" fill="none" stroke="#333" stroke-width="0.5" stroke-opacity="0.4" />
<path d="M20 18 Q23 20 26 18" fill="none" stroke="#333" stroke-width="0.5" stroke-opacity="0.35" />
<path d="M30 26 Q33 28 36 26" fill="none" stroke="#555" stroke-width="0.5" stroke-opacity="0.3" />`,
  },

  // 大河 — Large River: "留白法" white-space + ink outline
  'large-river': {
    id: 'terrain-large-river',
    width: 40,
    height: 40,
    content: `<rect width="40" height="40" fill="#f5f0e8" />
<!-- river banks with light wash -->
<path d="M0 0 Q6 10 4 20 Q2 30 8 40" fill="none" stroke="#999" stroke-width="1.5" stroke-opacity="0.4" />
<path d="M0 2 Q8 10 6 20 Q4 30 10 40" fill="none" stroke="#ccc" stroke-width="2.5" stroke-opacity="0.3" />
<!-- water flow lines -->
<path d="M10 6 Q16 10 14 16" fill="none" stroke="#999" stroke-width="0.6" stroke-opacity="0.3" />
<path d="M8 20 Q16 24 12 30" fill="none" stroke="#ccc" stroke-width="0.6" stroke-opacity="0.25" />
<path d="M14 34 Q18 36 16 40" fill="none" stroke="#999" stroke-width="0.5" stroke-opacity="0.25" />
<!-- far bank -->
<path d="M12 0 Q18 10 16 20 Q14 30 20 40" fill="none" stroke="#555" stroke-width="0.8" stroke-opacity="0.2" />
<path d="M40 0 Q34 12 36 24 Q38 34 30 40" fill="none" stroke="#999" stroke-width="1" stroke-opacity="0.35" />`,
  },

  // 草原 — Grassland: "点苔法" ink-dot vegetation
  grassland: {
    id: 'terrain-grassland',
    width: 32,
    height: 32,
    content: `<rect width="32" height="32" fill="#f5f0e8" />
<!-- light wash ground -->
<rect width="32" height="32" fill="#999" fill-opacity="0.06" />
<!-- grass strokes - varying ink dots -->
<path d="M4 28 Q5 24 6 20" fill="none" stroke="#555" stroke-width="0.8" stroke-opacity="0.4" />
<path d="M3 28 Q3.5 25 4 22" fill="none" stroke="#999" stroke-width="0.5" stroke-opacity="0.3" />
<path d="M10 30 Q11 25 12 22" fill="none" stroke="#333" stroke-width="0.8" stroke-opacity="0.35" />
<path d="M9 30 Q9.5 27 10 24" fill="none" stroke="#999" stroke-width="0.5" stroke-opacity="0.25" />
<path d="M16 28 Q17 23 18 18" fill="none" stroke="#555" stroke-width="0.8" stroke-opacity="0.4" />
<path d="M15 28 Q15.5 25 16 22" fill="none" stroke="#ccc" stroke-width="0.5" stroke-opacity="0.25" />
<path d="M22 30 Q23 26 24 22" fill="none" stroke="#333" stroke-width="0.8" stroke-opacity="0.35" />
<path d="M27 28 Q28 24 29 20" fill="none" stroke="#555" stroke-width="0.7" stroke-opacity="0.35" />
<!-- scattered ink dots (苔点) -->
<circle cx="6" cy="18" r="1.5" fill="#555" fill-opacity="0.3" />
<circle cx="14" cy="16" r="1.2" fill="#333" fill-opacity="0.25" />
<circle cx="22" cy="20" r="1.8" fill="#555" fill-opacity="0.3" />
<circle cx="28" cy="18" r="1" fill="#999" fill-opacity="0.25" />
<circle cx="18" cy="24" r="1.3" fill="#333" fill-opacity="0.2" />`,
  },

  // 森林 — Forest: ink tree clusters
  forest: {
    id: 'terrain-forest',
    width: 40,
    height: 40,
    content: `<rect width="40" height="40" fill="#f5f0e8" />
<!-- ink wash base -->
<rect width="40" height="40" fill="#555" fill-opacity="0.04" />
<!-- tree cluster 1 -->
<circle cx="10" cy="14" r="7" fill="#333" fill-opacity="0.2" />
<circle cx="10" cy="14" r="4" fill="#555" fill-opacity="0.15" />
<line x1="10" y1="14" x2="10" y2="22" stroke="#555" stroke-width="0.8" stroke-opacity="0.4" />
<!-- tree cluster 2 -->
<circle cx="26" cy="12" r="8" fill="#333" fill-opacity="0.18" />
<circle cx="26" cy="12" r="5" fill="#555" fill-opacity="0.15" />
<line x1="26" y1="12" x2="26" y2="22" stroke="#555" stroke-width="0.8" stroke-opacity="0.35" />
<!-- tree cluster 3 (small) -->
<circle cx="18" cy="26" r="5" fill="#555" fill-opacity="0.15" />
<circle cx="18" cy="26" r="3" fill="#999" fill-opacity="0.12" />
<line x1="18" y1="26" x2="18" y2="32" stroke="#999" stroke-width="0.6" stroke-opacity="0.3" />
<!-- tree cluster 4 -->
<circle cx="34" cy="24" r="6" fill="#333" fill-opacity="0.15" />
<line x1="34" y1="24" x2="34" y2="32" stroke="#555" stroke-width="0.6" stroke-opacity="0.3" />
<!-- scattered dots -->
<circle cx="4" cy="22" r="1.5" fill="#555" fill-opacity="0.2" />
<circle cx="30" cy="34" r="1.2" fill="#333" fill-opacity="0.15" />`,
  },

  // 大海 — Ocean: traditional "鱼鳞纹" fish-scale wave pattern
  ocean: {
    id: 'terrain-ocean',
    width: 32,
    height: 32,
    content: `<rect width="32" height="32" fill="#f5f0e8" />
<!-- light wash -->
<rect width="32" height="32" fill="#999" fill-opacity="0.05" />
<!-- wave rows - traditional fish-scale style -->
<path d="M0 4 Q4 1 8 4 Q12 7 16 4 Q20 1 24 4 Q28 7 32 4" fill="none" stroke="#555" stroke-width="0.7" stroke-opacity="0.35" />
<path d="M0 8 Q4 5 8 8 Q12 11 16 8 Q20 5 24 8 Q28 11 32 8" fill="none" stroke="#999" stroke-width="0.6" stroke-opacity="0.25" />
<path d="M0 14 Q4 11 8 14 Q12 17 16 14 Q20 11 24 14 Q28 17 32 14" fill="none" stroke="#555" stroke-width="0.7" stroke-opacity="0.3" />
<path d="M0 18 Q4 15 8 18 Q12 21 16 18 Q20 15 24 18 Q28 21 32 18" fill="none" stroke="#999" stroke-width="0.5" stroke-opacity="0.2" />
<path d="M0 24 Q4 21 8 24 Q12 27 16 24 Q20 21 24 24 Q28 27 32 24" fill="none" stroke="#555" stroke-width="0.7" stroke-opacity="0.3" />
<path d="M0 28 Q4 25 8 28 Q12 31 16 28 Q20 25 24 28 Q28 31 32 28" fill="none" stroke="#999" stroke-width="0.5" stroke-opacity="0.2" />
<!-- foam dots -->
<circle cx="4" cy="6" r="0.6" fill="#ccc" fill-opacity="0.3" />
<circle cx="16" cy="16" r="0.5" fill="#ccc" fill-opacity="0.25" />
<circle cx="28" cy="10" r="0.6" fill="#ccc" fill-opacity="0.3" />`,
  },

  // 湖泊 — Lake: "留白" white space + light ink border
  lake: {
    id: 'terrain-lake',
    width: 36,
    height: 36,
    content: `<rect width="36" height="36" fill="#f5f0e8" />
<!-- lake body - white/empty -->
<!-- shore outline -->
<ellipse cx="18" cy="18" rx="14" ry="11" fill="none" stroke="#999" stroke-width="0.8" stroke-opacity="0.35" />
<ellipse cx="18" cy="18" rx="12" ry="9" fill="none" stroke="#ccc" stroke-width="0.6" stroke-opacity="0.25" />
<!-- subtle water lines -->
<path d="M10 16 Q14 15 18 16 Q22 17 26 16" fill="none" stroke="#ccc" stroke-width="0.5" stroke-opacity="0.25" />
<path d="M10 20 Q14 19 18 20 Q22 21 26 20" fill="none" stroke="#ccc" stroke-width="0.4" stroke-opacity="0.2" />
<!-- ink dots around shore -->
<circle cx="6" cy="12" r="1.5" fill="#555" fill-opacity="0.2" />
<circle cx="30" cy="14" r="1.2" fill="#555" fill-opacity="0.18" />
<circle cx="10" cy="28" r="1" fill="#999" fill-opacity="0.2" />
<circle cx="28" cy="26" r="1.3" fill="#555" fill-opacity="0.18" />`,
  },

  // 戈壁 — Gobi: "枯笔" dry-brush effect with scattered stones
  gobi: {
    id: 'terrain-gobi',
    width: 32,
    height: 32,
    content: `<rect width="32" height="32" fill="#f5f0e8" />
<!-- dry wash -->
<rect width="32" height="32" fill="#999" fill-opacity="0.04" />
<!-- dry brush texture strokes -->
<path d="M2 6 Q8 5 14 7 Q20 9 26 6 Q30 5 32 7" fill="none" stroke="#ccc" stroke-width="1.5" stroke-opacity="0.2" />
<path d="M0 16 Q6 14 12 17 Q18 19 24 16 Q28 14 32 17" fill="none" stroke="#ccc" stroke-width="1.2" stroke-opacity="0.18" />
<path d="M0 24 Q8 23 16 25 Q24 27 32 24" fill="none" stroke="#ccc" stroke-width="1" stroke-opacity="0.15" />
<!-- scattered rocks in various ink tones -->
<circle cx="6" cy="8" r="2" fill="#555" fill-opacity="0.3" />
<circle cx="20" cy="6" r="1.5" fill="#333" fill-opacity="0.25" />
<circle cx="14" cy="18" r="2.5" fill="#555" fill-opacity="0.25" />
<circle cx="26" cy="20" r="1.8" fill="#999" fill-opacity="0.25" />
<circle cx="8" cy="26" r="1.5" fill="#333" fill-opacity="0.2" />
<circle cx="24" cy="28" r="1.2" fill="#555" fill-opacity="0.2" />
<!-- small gravel dots -->
<circle cx="10" cy="12" r="0.8" fill="#999" fill-opacity="0.2" />
<circle cx="22" cy="14" r="0.6" fill="#ccc" fill-opacity="0.2" />`,
  },

  // 沙漠 — Desert: ink-wash dune lines with dot vegetation
  desert: {
    id: 'terrain-desert',
    width: 36,
    height: 36,
    content: `<rect width="36" height="36" fill="#f5f0e8" />
<!-- light wash -->
<rect width="36" height="36" fill="#999" fill-opacity="0.04" />
<!-- dune curves with light ink -->
<path d="M0 12 Q9 6 18 12 Q27 18 36 12" fill="none" stroke="#999" stroke-width="1.2" stroke-opacity="0.3" />
<path d="M0 18 Q9 12 18 18 Q27 24 36 18" fill="none" stroke="#555" stroke-width="0.8" stroke-opacity="0.25" />
<path d="M0 24 Q9 20 18 24 Q27 28 36 24" fill="none" stroke="#999" stroke-width="0.8" stroke-opacity="0.2" />
<path d="M0 30 Q9 26 18 30 Q27 34 36 30" fill="none" stroke="#ccc" stroke-width="0.6" stroke-opacity="0.15" />
<!-- dune ridge dots -->
<circle cx="9" cy="10" r="0.7" fill="#555" fill-opacity="0.2" />
<circle cx="18" cy="14" r="0.6" fill="#999" fill-opacity="0.2" />
<circle cx="27" cy="10" r="0.8" fill="#555" fill-opacity="0.18" />
<!-- sparse desert vegetation dots -->
<circle cx="6" cy="20" r="1.2" fill="#555" fill-opacity="0.2" />
<circle cx="24" cy="22" r="1" fill="#999" fill-opacity="0.18" />
<circle cx="14" cy="28" r="1.5" fill="#555" fill-opacity="0.2" />`,
  },
};
