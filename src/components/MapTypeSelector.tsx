import type { ProjectMapType } from '../types';
import { MAP_TYPES } from '../types';

interface Props {
  value: ProjectMapType;
  onChange: (type: ProjectMapType) => void;
}

export function MapTypeSelector({ value, onChange }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {MAP_TYPES.map((mt) => (
        <button
          key={mt.type}
          onClick={() => onChange(mt.type)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: 10,
            borderRadius: 8,
            border: value === mt.type ? '2px solid #1a73e8' : '2px solid #e0e0e0',
            background: value === mt.type ? '#f0f7ff' : '#fff',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.15s',
          }}
        >
          {/* SVG thumbnail preview */}
          <div
            style={{
              width: 90,
              height: 60,
              borderRadius: 4,
              overflow: 'hidden',
              flexShrink: 0,
              background: '#f5f5f5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            dangerouslySetInnerHTML={{ __html: mt.svgPreview }}
          />
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: '#333' }}>{mt.labelZh}</div>
            <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{mt.description}</div>
          </div>
        </button>
      ))}
    </div>
  );
}
