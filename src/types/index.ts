export type ToolType = 'select' | 'pen' | 'highlighter' | 'eraser' | 'icon' | 'text' | 'terrain' | 'territory';

export type BrushMode = 'solid' | 'texture';
export type EraserMode = 'click' | 'cut';
export type LineWidthMode = 'screen' | 'map';

export type ProjectMapType = 'amap-normal' | 'amap-satellite' | 'maplibre-outdoor-contour';

export interface TracingProject {
  id: string;
  name: string;
  mapType: ProjectMapType;
  backgroundColor: string;
  elements: DrawingElement[];
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
}

export type TerrainType = 'mountains' | 'large-river' | 'grassland' | 'forest' | 'ocean' | 'lake' | 'gobi' | 'desert';

export interface TerrainDef {
  type: TerrainType;
  labelZh: string;
  label: string;
  color: string;
}

export const TERRAIN_DEFS: TerrainDef[] = [
  { type: 'mountains', labelZh: '山脉', label: 'Mountain', color: '#8B7355' },
  { type: 'large-river', labelZh: '大河', label: 'Large River', color: '#4A90D9' },
  { type: 'grassland', labelZh: '草原', label: 'Grassland', color: '#7CB342' },
  { type: 'forest', labelZh: '森林', label: 'Forest', color: '#2E7D32' },
  { type: 'ocean', labelZh: '大海', label: 'Ocean', color: '#1565C0' },
  { type: 'lake', labelZh: '湖泊', label: 'Lake', color: '#42A5F5' },
  { type: 'gobi', labelZh: '戈壁', label: 'Gobi', color: '#BCAAA4' },
  { type: 'desert', labelZh: '沙漠', label: 'Desert', color: '#FFCC80' },
];

export interface MapTypeDef {
  type: ProjectMapType;
  labelZh: string;
  label: string;
  description: string;
  svgPreview: string; // inline SVG markup for thumbnail
}

export const MAP_TYPES: MapTypeDef[] = [
  {
    type: 'amap-normal',
    labelZh: '高德普通地图',
    label: 'AMap Normal',
    description: '标准道路地图，适合标注城市、路线',
    svgPreview: `<svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">
      <rect width="120" height="80" fill="#f0f2f5"/>
      <rect x="30" y="10" width="60" height="4" rx="2" fill="#bcc7d3"/>
      <rect x="10" y="35" width="100" height="3" rx="1.5" fill="#bcc7d3"/>
      <rect x="20" y="60" width="80" height="3" rx="1.5" fill="#bcc7d3"/>
      <rect x="50" y="5" width="3" height="20" rx="1.5" fill="#bcc7d3"/>
      <rect x="80" y="25" width="3" height="30" rx="1.5" fill="#bcc7d3"/>
      <rect x="35" y="45" width="3" height="20" rx="1.5" fill="#bcc7d3"/>
      <circle cx="55" cy="20" r="4" fill="#4CAF50"/>
      <circle cx="85" cy="45" r="4" fill="#FF9800"/>
      <circle cx="35" cy="55" r="4" fill="#2196F3"/>
    </svg>`,
  },
  {
    type: 'amap-satellite',
    labelZh: '高德卫星+路网',
    label: 'AMap Satellite + Road',
    description: '卫星影像叠加路网标注',
    svgPreview: `<svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="sat-pattern" width="8" height="8" patternUnits="userSpaceOnUse">
          <rect width="8" height="8" fill="#3a5f3a"/>
          <rect x="0" y="0" width="4" height="4" fill="#4a7a4a" opacity="0.5"/>
          <rect x="4" y="4" width="4" height="4" fill="#2d4a2d" opacity="0.5"/>
        </pattern>
      </defs>
      <rect width="120" height="80" fill="url(#sat-pattern)"/>
      <rect x="30" y="10" width="60" height="4" rx="2" fill="#fff" opacity="0.6"/>
      <rect x="10" y="35" width="100" height="3" rx="1.5" fill="#fff" opacity="0.5"/>
      <rect x="50" y="5" width="3" height="20" rx="1.5" fill="#fff" opacity="0.5"/>
      <rect x="35" y="45" width="3" height="20" rx="1.5" fill="#fff" opacity="0.5"/>
    </svg>`,
  },
  {
    type: 'maplibre-outdoor-contour',
    labelZh: 'MapTiler Outdoor+等高线',
    label: 'MapTiler Outdoor + Contours',
    description: '户外地形图叠加等高线，适合自然地形追踪',
    svgPreview: `<svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">
      <rect width="120" height="80" fill="#e8dcc8"/>
      <path d="M0 50 Q30 30 60 50 Q90 70 120 50" fill="none" stroke="#b8a88a" stroke-width="1"/>
      <path d="M0 55 Q30 35 60 55 Q90 75 120 55" fill="none" stroke="#b8a88a" stroke-width="0.8"/>
      <path d="M0 45 Q30 25 60 45 Q90 65 120 45" fill="none" stroke="#b8a88a" stroke-width="0.8"/>
      <path d="M0 60 Q30 40 60 60 Q90 80 120 60" fill="none" stroke="#b8a88a" stroke-width="0.6"/>
      <circle cx="40" cy="42" r="6" fill="#6b8e23" opacity="0.5"/>
      <circle cx="70" cy="55" r="5" fill="#6b8e23" opacity="0.4"/>
    </svg>`,
  },
];

export interface Point {
  lat: number;
  lng: number;
}

export interface DrawingStyle {
  color: string;
  width: number;
  opacity?: number; // for highlighter
  // Backward compat with old types
  fillColor?: string;
  fillOpacity?: number;
}

export interface DrawingElement {
  id: string;
  type: string; // 'path' | 'icon' | 'text' | 'terrain-fill' | 'freehand' | 'line' | ...
  points: Point[];
  style: DrawingStyle;
  text?: string;
  icon?: string;
  label?: string; // backward compat
  terrainType?: TerrainType; // for terrain-fill elements
}

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  backgroundColor: string; // 'transparent' or 'rgba(r,g,b,a)'
  elements: DrawingElement[];
}

export interface MapViewport {
  center: Point;
  zoom: number;
}

export interface IconDef {
  type: string;
  label: string;
  emoji: string;
}

export const ICONS: IconDef[] = [
  { type: 'city', label: '城市', emoji: '🏙️' },
  { type: 'fortress', label: '关隘', emoji: '🏯' },
  { type: 'port', label: '港口', emoji: '⚓' },
  { type: 'battle', label: '战役', emoji: '⚔️' },
  { type: 'mine', label: '矿', emoji: '⛏️' },
  { type: 'coal', label: '煤', emoji: '🪨' },
  { type: 'castle', label: '城堡', emoji: '🏰' },
  { type: 'camp', label: '营地', emoji: '🏕️' },
  { type: 'temple', label: '寺庙', emoji: '⛩️' },
  { type: 'flag', label: '旗帜', emoji: '🏁' },
  { type: 'shield', label: '防御', emoji: '🛡️' },
  { type: 'gem', label: '资源', emoji: '💎' },
  { type: 'forest', label: '森林', emoji: '🌲' },
  { type: 'farm', label: '农田', emoji: '🌾' },
  { type: 'mountain', label: '山脉', emoji: '🏔️' },
  { type: 'river', label: '河流', emoji: '🌊' },
  { type: 'star', label: '重要', emoji: '⭐' },
  { type: 'fire', label: '烽火', emoji: '🔥' },
  { type: 'map', label: '地点', emoji: '🗺️' },
  { type: 'pin', label: '标记', emoji: '📍' },
  { type: 'gas', label: '石油', emoji: '⛽' },
  { type: 'corn', label: '粮食', emoji: '🌽' },
  { type: 'build', label: '建筑', emoji: '🏗️' },
  { type: 'train', label: '铁路', emoji: '🚂' },
  { type: 'bridge', label: '桥梁', emoji: '🌉' },
  { type: 'lighthouse', label: '灯塔', emoji: '🗼' },
];

/** Ancient Chinese color palette for territory/region fills */
export const ANCIENT_COLORS = [
  { label: '朱红', value: '#C23A2B' },
  { label: '黛蓝', value: '#425066' },
  { label: '松花绿', value: '#5E7B4A' },
  { label: '鸦青', value: '#424C50' },
  { label: '琥珀', value: '#CA6924' },
  { label: '绀紫', value: '#6A4C6E' },
  { label: '竹青', value: '#789262' },
  { label: '胭脂', value: '#9E2A2B' },
  { label: '月白', value: '#D6ECF0' },
  { label: '赭石', value: '#8B5A2B' },
];

/** Ink-wash five-color system: 焦/浓/重/淡/清 */
export const INK_COLORS = [
  { label: '焦墨', value: '#1a1a1a' },
  { label: '浓墨', value: '#333333' },
  { label: '重墨', value: '#555555' },
  { label: '淡墨', value: '#999999' },
  { label: '清墨', value: '#CCCCCC' },
];

export interface ExportOptions {
  scale: 1 | 2 | 4;
  includeBackground: boolean;
  includeBorder: boolean;
  includeMap: boolean;
}

export const DEFAULT_EXPORT_OPTIONS: ExportOptions = {
  scale: 2,
  includeBackground: true,
  includeBorder: false,
  includeMap: false,
};

export const LAYER_BACKGROUNDS = [
  { label: '透明', value: 'transparent' },
  { label: '米白', value: 'rgba(255,248,220,0.15)' },
  { label: '浅蓝', value: 'rgba(230,243,255,0.2)' },
  { label: '浅粉', value: 'rgba(255,228,225,0.2)' },
  { label: '浅黄', value: 'rgba(255,250,205,0.2)' },
  { label: '浅绿', value: 'rgba(232,245,233,0.2)' },
  { label: '浅紫', value: 'rgba(240,230,255,0.2)' },
  { label: '浅橙', value: 'rgba(255,243,224,0.2)' },
  { label: '浅灰', value: 'rgba(245,245,245,0.25)' },
];
