import { create } from 'zustand';
import type { DrawingElement, Layer, ToolType } from '../types';

function genLayerId(): string {
  return `layer_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

interface MapStore {
  // Map instance
  map: any;
  setMap: (map: any) => void;

  // Provider switching
  mapProvider: 'amap' | 'maplibre';
  setMapProvider: (p: 'amap' | 'maplibre') => void;

  // AMap settings
  amapMapType: 'satellite' | 'normal';
  setAmapMapType: (t: 'satellite' | 'normal') => void;
  amapShowRoadNet: boolean;
  setAmapShowRoadNet: (s: boolean) => void;

  // MapLibre (MapTiler) settings
  maplibreStyle: string;
  setMaplibreStyle: (s: string) => void;
  terrainEnabled: boolean;
  setTerrainEnabled: (b: boolean) => void;
  maplibrePitch: number;
  setMaplibrePitch: (p: number) => void;
  showContours: boolean;
  setShowContours: (b: boolean) => void;

  // Layers
  layers: Layer[];
  activeLayerId: string | null;
  addLayer: (name: string, backgroundColor: string) => void;
  removeLayer: (id: string) => void;
  setActiveLayer: (id: string) => void;
  toggleLayerVisibility: (id: string) => void;
  renameLayer: (id: string, name: string) => void;

  activeLayer: () => Layer | undefined;

  // Tool
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;

  // Pen style
  strokeColor: string;
  strokeWidth: number;
  setStrokeColor: (color: string) => void;
  setStrokeWidth: (width: number) => void;

  // Highlighter style
  highlighterColor: string;
  highlighterWidth: number;
  highlighterOpacity: number;
  setHighlighterColor: (color: string) => void;
  setHighlighterWidth: (width: number) => void;
  setHighlighterOpacity: (opacity: number) => void;

  // Eraser
  eraserSize: number;
  setEraserSize: (size: number) => void;

  // Icon
  selectedIcon: string;
  setSelectedIcon: (icon: string) => void;

  // Elements
  addElement: (element: DrawingElement) => void;
  removeElement: (elementId: string) => void;
  updateElement: (elementId: string, updates: Partial<DrawingElement>) => void;

  // Undo
  undoStack: { layerId: string; elementId: string }[];
  undo: () => void;
}

export const useMapStore = create<MapStore>((set, get) => ({
  map: null,
  setMap: (map) => set({ map }),

  mapProvider: 'amap',
  setMapProvider: (p) => set({ mapProvider: p }),

  amapMapType: 'normal',
  setAmapMapType: (t) => set({ amapMapType: t }),
  amapShowRoadNet: true,
  setAmapShowRoadNet: (s) => set({ amapShowRoadNet: s }),

  maplibreStyle: 'topo',
  setMaplibreStyle: (s) => set({ maplibreStyle: s }),
  terrainEnabled: false,
  setTerrainEnabled: (b) => set({ terrainEnabled: b }),
  maplibrePitch: 0,
  setMaplibrePitch: (p) => set({ maplibrePitch: p }),
  showContours: false,
  setShowContours: (b) => set({ showContours: b }),

  layers: [],
  activeLayerId: null,
  addLayer: (name, backgroundColor) => {
    const id = genLayerId();
    const layer: Layer = {
      id,
      name,
      visible: true,
      backgroundColor,
      elements: [],
    };
    set((s) => ({
      layers: [...s.layers, layer],
      activeLayerId: id,
    }));
  },
  removeLayer: (id) => {
    set((s) => {
      const layers = s.layers.filter((l) => l.id !== id);
      return {
        layers,
        activeLayerId: s.activeLayerId === id
          ? (layers.length > 0 ? layers[layers.length - 1].id : null)
          : s.activeLayerId,
      };
    });
  },
  setActiveLayer: (id) => set({ activeLayerId: id }),
  toggleLayerVisibility: (id) => {
    set((s) => ({
      layers: s.layers.map((l) =>
        l.id === id ? { ...l, visible: !l.visible } : l
      ),
    }));
  },
  renameLayer: (id, name) => {
    set((s) => ({
      layers: s.layers.map((l) => (l.id === id ? { ...l, name } : l)),
    }));
  },

  activeLayer: () => {
    const { layers, activeLayerId } = get();
    return layers.find((l) => l.id === activeLayerId);
  },

  activeTool: 'pen',
  setActiveTool: (tool) => set({ activeTool: tool }),

  // Pen style
  strokeColor: '#ff0000',
  strokeWidth: 3,
  setStrokeColor: (color) => set({ strokeColor: color }),
  setStrokeWidth: (width) => set({ strokeWidth: width }),

  // Highlighter style
  highlighterColor: '#FFD700',
  highlighterWidth: 20,
  highlighterOpacity: 0.35,
  setHighlighterColor: (color) => set({ highlighterColor: color }),
  setHighlighterWidth: (width) => set({ highlighterWidth: width }),
  setHighlighterOpacity: (opacity) => set({ highlighterOpacity: opacity }),

  // Eraser
  eraserSize: 15,
  setEraserSize: (size) => set({ eraserSize: size }),

  // Icon
  selectedIcon: '📍',
  setSelectedIcon: (icon) => set({ selectedIcon: icon }),

  addElement: (element) => {
    const { activeLayerId } = get();
    if (!activeLayerId) return;
    set((s) => ({
      layers: s.layers.map((l) =>
        l.id === activeLayerId
          ? { ...l, elements: [...l.elements, element] }
          : l
      ),
      undoStack: [...s.undoStack, { layerId: activeLayerId, elementId: element.id }],
    }));
  },
  removeElement: (elementId) => {
    set((s) => ({
      layers: s.layers.map((l) => ({
        ...l,
        elements: l.elements.filter((e) => e.id !== elementId),
      })),
    }));
  },
  updateElement: (elementId, updates) => {
    set((s) => ({
      layers: s.layers.map((l) => ({
        ...l,
        elements: l.elements.map((e) =>
          e.id === elementId ? { ...e, ...updates } : e
        ),
      })),
    }));
  },

  undoStack: [],
  undo: () => {
    const { undoStack, layers } = get();
    if (undoStack.length === 0) return;
    const last = undoStack[undoStack.length - 1];
    set((s) => ({
      layers: s.layers.map((l) => ({
        ...l,
        elements: l.elements.filter((e) => e.id !== last.elementId),
      })),
      undoStack: s.undoStack.slice(0, -1),
    }));
  },
}));
