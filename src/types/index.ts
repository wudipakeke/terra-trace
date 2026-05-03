export type ToolType = 'select' | 'pen' | 'highlighter' | 'eraser' | 'icon' | 'text';

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
  type: string; // 'path' | 'icon' | 'text' | 'freehand' | 'line' | ...
  points: Point[];
  style: DrawingStyle;
  text?: string;
  icon?: string;
  label?: string; // backward compat
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
