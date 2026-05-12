import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DrawingElement, ToolType, TracingProject, ProjectMapType, TerrainType, MapViewport, BrushMode, EraserMode, LineWidthMode, ExportOptions } from '../types';
import { DEFAULT_EXPORT_OPTIONS } from '../types';

function genId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

interface MapStore {
  // Navigation
  page: 'landing' | 'editor';
  setPage: (page: 'landing' | 'editor') => void;

  // Projects
  projects: TracingProject[];
  currentProjectId: string | null;
  createProject: (name: string, mapType: ProjectMapType, backgroundColor: string) => string;
  updateProject: (id: string, updates: Partial<Pick<TracingProject, 'name' | 'backgroundColor'>>) => void;
  deleteProject: (id: string) => void;
  openProject: (id: string) => void;
  closeProject: () => void;
  currentProject: () => TracingProject | undefined;

  // Map instance (runtime only, not persisted)
  map: any;
  setMap: (map: any) => void;

  // Map engine settings (derived from project)
  mapProvider: 'amap' | 'maplibre';
  setMapProvider: (p: 'amap' | 'maplibre') => void;
  amapMapType: 'satellite' | 'normal';
  setAmapMapType: (t: 'satellite' | 'normal') => void;
  amapShowRoadNet: boolean;
  setAmapShowRoadNet: (s: boolean) => void;
  maplibreStyle: string;
  setMaplibreStyle: (s: string) => void;
  terrainEnabled: boolean;
  setTerrainEnabled: (b: boolean) => void;
  maplibrePitch: number;
  setMaplibrePitch: (p: number) => void;
  showContours: boolean;
  setShowContours: (b: boolean) => void;

  // Map view toggle
  showMapView: boolean;
  setShowMapView: (show: boolean) => void;

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

  // Brush mode (unified brush: solid or texture)
  brushMode: BrushMode;
  setBrushMode: (mode: BrushMode) => void;

  // Eraser mode
  eraserMode: EraserMode;
  setEraserMode: (mode: EraserMode) => void;

  // Line width scaling
  lineWidthMode: LineWidthMode;
  setLineWidthMode: (mode: LineWidthMode) => void;

  // Terrain brush
  selectedTerrainType: TerrainType;
  setSelectedTerrainType: (type: TerrainType) => void;
  terrainBrushSize: number;
  setTerrainBrushSize: (size: number) => void;

  // Territory tool
  territoryColor: string;
  setTerritoryColor: (color: string) => void;

  // Map opacity (0-1)
  mapOpacity: number;
  setMapOpacity: (opacity: number) => void;

  // Show decorative border
  showBorder: boolean;
  setShowBorder: (show: boolean) => void;

  // Export options
  exportOptions: ExportOptions;
  setExportOptions: (opts: ExportOptions) => void;

  // Elements (operate on current project)
  addElement: (element: DrawingElement) => void;
  removeElement: (elementId: string) => void;
  updateElement: (elementId: string, updates: Partial<DrawingElement>) => void;

  // Map viewport persistence
  mapViewport: MapViewport;
  setMapViewport: (viewport: MapViewport) => void;

  // Undo / Redo
  undoStack: { projectId: string; element: DrawingElement }[];
  redoStack: { projectId: string; element: DrawingElement }[];
  undo: () => void;
  redo: () => void;
}

function applyProjectConfig(project: TracingProject) {
  const config = PROJECT_MAP_CONFIGS[project.mapType];
  return config ?? { mapProvider: 'amap' as const, amapMapType: 'normal' as const };
}

const PROJECT_MAP_CONFIGS: Record<ProjectMapType, {
  mapProvider: 'amap' | 'maplibre';
  amapMapType?: 'satellite' | 'normal';
  amapShowRoadNet?: boolean;
  maplibreStyle?: string;
  showContours?: boolean;
}> = {
  'amap-normal': { mapProvider: 'amap', amapMapType: 'normal' },
  'amap-satellite': { mapProvider: 'amap', amapMapType: 'satellite', amapShowRoadNet: true },
  'maplibre-outdoor-contour': { mapProvider: 'maplibre', maplibreStyle: 'outdoor', showContours: true },
};

export const useMapStore = create<MapStore>()(
  persist(
    (set, get) => ({
      // Navigation
      page: 'landing',
      setPage: (page) => set({ page }),

      // Projects
      projects: [],
      currentProjectId: null,
      createProject: (name, mapType, backgroundColor) => {
        const id = genId();
        const project: TracingProject = {
          id,
          name,
          mapType,
          backgroundColor,
          elements: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set((s) => ({
          projects: [...s.projects, project],
        }));
        return id;
      },
      updateProject: (id, updates) => {
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p
          ),
        }));
      },
      deleteProject: (id) => {
        set((s) => ({
          projects: s.projects.filter((p) => p.id !== id),
          currentProjectId: s.currentProjectId === id ? null : s.currentProjectId,
        }));
      },
      openProject: (id) => {
        const project = get().projects.find((p) => p.id === id);
        if (!project) return;
        const config = applyProjectConfig(project);
        set({
          currentProjectId: id,
          page: 'editor',
          showMapView: false,
          undoStack: [],
          redoStack: [],
          mapProvider: config.mapProvider,
          amapMapType: config.amapMapType ?? 'normal',
          amapShowRoadNet: config.amapShowRoadNet ?? false,
          maplibreStyle: config.maplibreStyle ?? 'outdoor',
          showContours: config.showContours ?? false,
        });
      },
      closeProject: () => {
        set({
          page: 'landing',
          currentProjectId: null,
          map: null,
          undoStack: [],
        });
      },
      currentProject: () => {
        const { projects, currentProjectId } = get();
        return projects.find((p) => p.id === currentProjectId);
      },

      // Map instance (runtime only)
      map: null,
      setMap: (map) => set({ map }),

      // Map viewport persistence
      mapViewport: { center: { lat: 39.90923, lng: 116.397428 }, zoom: 12 },
      setMapViewport: (viewport) => set({ mapViewport: viewport }),

      // Map engine settings
      mapProvider: 'amap',
      setMapProvider: (p) => set({ mapProvider: p }),
      amapMapType: 'normal',
      setAmapMapType: (t) => set({ amapMapType: t }),
      amapShowRoadNet: true,
      setAmapShowRoadNet: (s) => set({ amapShowRoadNet: s }),
      maplibreStyle: 'outdoor',
      setMaplibreStyle: (s) => set({ maplibreStyle: s }),
      terrainEnabled: false,
      setTerrainEnabled: (b) => set({ terrainEnabled: b }),
      maplibrePitch: 0,
      setMaplibrePitch: (p) => set({ maplibrePitch: p }),
      showContours: false,
      setShowContours: (b) => set({ showContours: b }),

      // Map view toggle
      showMapView: false,
      setShowMapView: (show) => set({ showMapView: show }),

      // Tool
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

      // Terrain brush
      selectedTerrainType: 'mountains',
      setSelectedTerrainType: (type) => set({ selectedTerrainType: type }),
      terrainBrushSize: 15,
      setTerrainBrushSize: (size) => set({ terrainBrushSize: size }),

      // Brush mode (unified)
      brushMode: 'solid',
      setBrushMode: (mode) => set({ brushMode: mode }),

      // Eraser mode
      eraserMode: 'click',
      setEraserMode: (mode) => set({ eraserMode: mode }),

      // Line width scaling
      lineWidthMode: 'screen',
      setLineWidthMode: (mode) => set({ lineWidthMode: mode }),

      // Territory tool
      territoryColor: '#C23A2B',
      setTerritoryColor: (color) => set({ territoryColor: color }),

      // Map opacity
      mapOpacity: 1,
      setMapOpacity: (opacity) => set({ mapOpacity: opacity }),

      // Border
      showBorder: false,
      setShowBorder: (show) => set({ showBorder: show }),

      // Export options
      exportOptions: DEFAULT_EXPORT_OPTIONS,
      setExportOptions: (opts) => set({ exportOptions: opts }),

      // Elements
      addElement: (element) => {
        const { currentProjectId } = get();
        if (!currentProjectId) return;
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === currentProjectId
              ? { ...p, elements: [...p.elements, element], updatedAt: Date.now() }
              : p
          ),
          undoStack: [...s.undoStack, { projectId: currentProjectId, element }],
          redoStack: [],
        }));
      },
      removeElement: (elementId) => {
        set((s) => ({
          projects: s.projects.map((p) => ({
            ...p,
            elements: p.elements.filter((e) => e.id !== elementId),
          })),
        }));
      },
      updateElement: (elementId, updates) => {
        set((s) => ({
          projects: s.projects.map((p) => ({
            ...p,
            elements: p.elements.map((e) =>
              e.id === elementId ? { ...e, ...updates } : e
            ),
          })),
        }));
      },

      // Undo / Redo
      undoStack: [],
      redoStack: [],
      undo: () => {
        const { undoStack } = get();
        if (undoStack.length === 0) return;
        const entry = undoStack[undoStack.length - 1];
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === entry.projectId
              ? { ...p, elements: p.elements.filter((e) => e.id !== entry.element.id), updatedAt: Date.now() }
              : p
          ),
          undoStack: s.undoStack.slice(0, -1),
          redoStack: [...s.redoStack, entry],
        }));
      },
      redo: () => {
        const { redoStack } = get();
        if (redoStack.length === 0) return;
        const entry = redoStack[redoStack.length - 1];
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === entry.projectId
              ? { ...p, elements: [...p.elements, entry.element], updatedAt: Date.now() }
              : p
          ),
          redoStack: s.redoStack.slice(0, -1),
          undoStack: [...s.undoStack, entry],
        }));
      },
    }),
    {
      name: 'map-tracing-store',
      partialize: (state) => ({
        projects: state.projects,
        currentProjectId: state.currentProjectId,
        page: state.page,
        showMapView: state.showMapView,
        activeTool: state.activeTool,
        mapViewport: state.mapViewport,
        strokeColor: state.strokeColor,
        strokeWidth: state.strokeWidth,
        highlighterColor: state.highlighterColor,
        highlighterWidth: state.highlighterWidth,
        highlighterOpacity: state.highlighterOpacity,
        eraserSize: state.eraserSize,
        selectedIcon: state.selectedIcon,
        selectedTerrainType: state.selectedTerrainType,
        terrainBrushSize: state.terrainBrushSize,
        brushMode: state.brushMode,
        lineWidthMode: state.lineWidthMode,
        territoryColor: state.territoryColor,
        mapOpacity: state.mapOpacity,
        showBorder: state.showBorder,
        exportOptions: state.exportOptions,
      }),
    }
  )
);
