import { ICONS } from '../types';

interface Props {
  onSelect: (emoji: string) => void;
}

export function IconPalette({ onSelect }: Props) {
  return (
    <div style={{
      position: 'absolute',
      bottom: '100%',
      left: '50%',
      transform: 'translateX(-50%)',
      marginBottom: 8,
      background: '#fff',
      borderRadius: 8,
      boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
      padding: 8,
      zIndex: 200,
      width: 280,
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: 4,
      }}>
        {ICONS.map((icon) => (
          <button
            key={icon.type}
            onClick={() => onSelect(icon.emoji)}
            title={icon.label}
            style={{
              border: 'none',
              background: 'transparent',
              borderRadius: 4,
              padding: 4,
              cursor: 'pointer',
              fontSize: 22,
              lineHeight: 1.4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.background = '#f0f0f0';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.background = 'transparent';
            }}
          >
            {icon.emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
