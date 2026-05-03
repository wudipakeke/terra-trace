import { useMapStore } from '../store/useMapStore';
import { exportLayerAsSvg, downloadSvg } from '../utils/svgExport';

export function ExportButton() {
  const layers = useMapStore((s) => s.layers);
  const activeLayerId = useMapStore((s) => s.activeLayerId);

  const handleExport = () => {
    const layer = layers.find((l) => l.id === activeLayerId);
    if (!layer) return;
    if (layer.elements.length === 0) {
      alert('当前图层没有任何元素');
      return;
    }
    const svg = exportLayerAsSvg(layer);
    if (!svg) return;
    const filename = `${layer.name}.svg`;
    downloadSvg(svg, filename);
  };

  return (
    <button
      onClick={handleExport}
      disabled={!activeLayerId}
      style={{
        width: '100%',
        border: '1px solid #1a73e8',
        background: '#fff',
        color: '#1a73e8',
        borderRadius: 4,
        padding: '4px 0',
        cursor: 'pointer',
        fontSize: 12,
      }}
    >
      导出当前图层为 SVG
    </button>
  );
}
