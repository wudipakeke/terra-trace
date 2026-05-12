import { LAYER_BACKGROUNDS } from '../types';

interface Props {
  value: string;
  onChange: (color: string) => void;
}

export function BackgroundColorPicker({ value, onChange }: Props) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {LAYER_BACKGROUNDS.map((bg) => (
        <button
          key={bg.value}
          title={bg.label}
          onClick={() => onChange(bg.value)}
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            border: value === bg.value ? '3px solid #1a73e8' : '2px solid #ddd',
            background: bg.value === 'transparent'
              ? 'repeating-conic-gradient(#ddd 0% 25%, transparent 0% 50%) 50% / 8px 8px'
              : bg.value,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {bg.value === 'transparent' && (
            <span style={{ fontSize: 14, color: '#666', fontWeight: 'bold' }}>/</span>
          )}
        </button>
      ))}
    </div>
  );
}
