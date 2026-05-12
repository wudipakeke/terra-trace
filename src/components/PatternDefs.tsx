import { getTerrainPatternId } from '../utils/terrainPatterns';

/**
 * Renders SVG <defs> containing all terrain pattern definitions.
 * Uses proper React SVG elements to avoid namespace issues with innerHTML.
 */
export function PatternDefs() {
  return (
    <defs>
      {/* Mountains */}
      <pattern id={getTerrainPatternId('mountains')} width={40} height={40} patternUnits="userSpaceOnUse" patternTransform="scale(0.8)">
        <rect width={40} height={40} fill="#8B7355" fillOpacity={0.12} />
        <path d="M0 38 L8 10 L16 38" fill="#8B7355" fillOpacity={0.5} stroke="#6D5A3D" strokeWidth={0.5} />
        <path d="M12 38 L20 6 L28 38" fill="#A0896C" fillOpacity={0.4} stroke="#6D5A3D" strokeWidth={0.5} />
        <path d="M24 38 L32 12 L40 38" fill="#6D5A3D" fillOpacity={0.45} stroke="#4A3728" strokeWidth={0.5} />
        <path d="M-4 38 L4 8 L12 38" fill="#9B8B78" fillOpacity={0.35} stroke="#6D5A3D" strokeWidth={0.4} />
      </pattern>

      {/* Large River */}
      <pattern id={getTerrainPatternId('large-river')} width={30} height={30} patternUnits="userSpaceOnUse" patternTransform="scale(0.8)">
        <rect width={30} height={30} fill="#4A90D9" fillOpacity={0.10} />
        <path d="M0 8 Q7 4 15 8 Q23 12 30 8" fill="none" stroke="#4A90D9" strokeWidth={2} strokeOpacity={0.4} />
        <path d="M0 14 Q7 10 15 14 Q23 18 30 14" fill="none" stroke="#4A90D9" strokeWidth={3} strokeOpacity={0.3} />
        <path d="M0 20 Q7 16 15 20 Q23 24 30 20" fill="none" stroke="#4A90D9" strokeWidth={1.5} strokeOpacity={0.35} />
      </pattern>

      {/* Grassland */}
      <pattern id={getTerrainPatternId('grassland')} width={24} height={24} patternUnits="userSpaceOnUse" patternTransform="scale(0.8)">
        <rect width={24} height={24} fill="#7CB342" fillOpacity={0.15} />
        <line x1={6} y1={18} x2={6} y2={12} stroke="#558B2F" strokeWidth={1.5} strokeOpacity={0.4} />
        <line x1={4} y1={18} x2={4} y2={14} stroke="#558B2F" strokeWidth={1} strokeOpacity={0.3} />
        <line x1={14} y1={20} x2={14} y2={13} stroke="#558B2F" strokeWidth={1.5} strokeOpacity={0.4} />
        <line x1={12} y1={20} x2={12} y2={15} stroke="#558B2F" strokeWidth={1} strokeOpacity={0.3} />
        <line x1={20} y1={16} x2={20} y2={10} stroke="#558B2F" strokeWidth={1.5} strokeOpacity={0.4} />
        <circle cx={6} cy={10} r={1} fill="#7CB342" fillOpacity={0.5} />
        <circle cx={14} cy={12} r={0.8} fill="#7CB342" fillOpacity={0.4} />
      </pattern>

      {/* Forest */}
      <pattern id={getTerrainPatternId('forest')} width={32} height={32} patternUnits="userSpaceOnUse" patternTransform="scale(0.8)">
        <rect width={32} height={32} fill="#2E7D32" fillOpacity={0.15} />
        <circle cx={8} cy={12} r={5} fill="#1B5E20" fillOpacity={0.4} />
        <rect x={7} y={16} width={2} height={4} fill="#5D4037" fillOpacity={0.4} />
        <circle cx={20} cy={10} r={4.5} fill="#2E7D32" fillOpacity={0.45} />
        <rect x={19} y={14} width={2} height={3.5} fill="#5D4037" fillOpacity={0.4} />
        <circle cx={26} cy={20} r={4} fill="#1B5E20" fillOpacity={0.35} />
        <rect x={25} y={23} width={2} height={3} fill="#5D4037" fillOpacity={0.4} />
        <circle cx={6} cy={26} r={3.5} fill="#388E3C" fillOpacity={0.4} />
        <rect x={5} y={29} width={2} height={3} fill="#5D4037" fillOpacity={0.35} />
      </pattern>

      {/* Ocean */}
      <pattern id={getTerrainPatternId('ocean')} width={24} height={24} patternUnits="userSpaceOnUse" patternTransform="scale(0.8)">
        <rect width={24} height={24} fill="#1565C0" fillOpacity={0.15} />
        <path d="M0 6 Q6 3 12 6 Q18 9 24 6" fill="none" stroke="#1565C0" strokeWidth={1.5} strokeOpacity={0.4} />
        <path d="M0 12 Q6 9 12 12 Q18 15 24 12" fill="none" stroke="#1976D2" strokeWidth={1.5} strokeOpacity={0.3} />
        <path d="M0 18 Q6 15 12 18 Q18 21 24 18" fill="none" stroke="#1565C0" strokeWidth={1.5} strokeOpacity={0.35} />
        <circle cx={6} cy={6} r={0.8} fill="#fff" fillOpacity={0.3} />
        <circle cx={18} cy={12} r={0.6} fill="#fff" fillOpacity={0.25} />
      </pattern>

      {/* Lake */}
      <pattern id={getTerrainPatternId('lake')} width={28} height={28} patternUnits="userSpaceOnUse" patternTransform="scale(0.8)">
        <rect width={28} height={28} fill="#42A5F5" fillOpacity={0.10} />
        <ellipse cx={14} cy={14} rx={10} ry={8} fill="none" stroke="#42A5F5" strokeWidth={1.5} strokeOpacity={0.35} />
        <ellipse cx={14} cy={14} rx={7} ry={5.5} fill="none" stroke="#64B5F6" strokeWidth={1} strokeOpacity={0.3} />
        <ellipse cx={14} cy={14} rx={4} ry={3} fill="none" stroke="#42A5F5" strokeWidth={0.8} strokeOpacity={0.25} />
        <ellipse cx={14} cy={14} rx={1.5} ry={1} fill="#64B5F6" fillOpacity={0.15} />
      </pattern>

      {/* Gobi */}
      <pattern id={getTerrainPatternId('gobi')} width={28} height={28} patternUnits="userSpaceOnUse" patternTransform="scale(0.8)">
        <rect width={28} height={28} fill="#BCAAA4" fillOpacity={0.12} />
        <circle cx={6} cy={8} r={2} fill="#A1887F" fillOpacity={0.4} />
        <circle cx={18} cy={6} r={1.5} fill="#8D6E63" fillOpacity={0.35} />
        <circle cx={12} cy={16} r={2.5} fill="#A1887F" fillOpacity={0.3} />
        <circle cx={22} cy={18} r={1.8} fill="#BCAAA4" fillOpacity={0.35} />
        <circle cx={6} cy={22} r={1.5} fill="#8D6E63" fillOpacity={0.3} />
        <rect x={15} y={11} width={3} height={2} rx={0.5} fill="#8D6E63" fillOpacity={0.25} />
      </pattern>

      {/* Desert */}
      <pattern id={getTerrainPatternId('desert')} width={30} height={30} patternUnits="userSpaceOnUse" patternTransform="scale(0.8)">
        <rect width={30} height={30} fill="#FFCC80" fillOpacity={0.12} />
        <path d="M0 18 Q7 14 15 18 Q23 22 30 18" fill="none" stroke="#FFA726" strokeWidth={1.5} strokeOpacity={0.35} />
        <path d="M-5 24 Q5 19 15 24 Q25 29 35 24" fill="none" stroke="#FFB74D" strokeWidth={1.5} strokeOpacity={0.3} />
        <path d="M0 10 Q8 6 16 10 Q24 14 30 10" fill="none" stroke="#FFA726" strokeWidth={1} strokeOpacity={0.25} />
        <circle cx={8} cy={14} r={1} fill="#FF8A65" fillOpacity={0.3} />
        <circle cx={20} cy={20} r={0.8} fill="#FF8A65" fillOpacity={0.25} />
      </pattern>
    </defs>
  );
}
