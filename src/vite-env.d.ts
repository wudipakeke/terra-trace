/// <reference types="vite/client" />

// Minimal AMap type declarations for the APIs we use
declare class AMapLngLat {
  constructor(lng: number, lat: number);
  getLat(): number;
  getLng(): number;
}

declare class AMapPixel {
  constructor(x: number, y: number);
  getX(): number;
  getY(): number;
}

declare class AMapMap {
  constructor(container: HTMLElement, opts?: Record<string, any>);
  setCenter(center: [number, number]): void;
  setZoom(zoom: number): void;
  lngLatToPixel(lnglat: AMapLngLat): AMapPixel;
  pixelToLngLat(pixel: AMapPixel): AMapLngLat;
  on(event: string, handler: (...args: any[]) => void): void;
  off(event: string, handler: (...args: any[]) => void): void;
  destroy(): void;
  getZoom(): number;
  getCenter(): AMapLngLat;
  getContainer(): HTMLElement;
}

declare class AMapTileLayer {
  constructor();
}
declare class AMapSatelliteTileLayer extends AMapTileLayer {}
declare class AMapRoadNetTileLayer extends AMapTileLayer {}

declare namespace AMap {
  export type Map = AMapMap;
  export type LngLat = AMapLngLat;
  export type Pixel = AMapPixel;
}

declare const AMap: {
  Map: typeof AMapMap;
  LngLat: typeof AMapLngLat;
  Pixel: typeof AMapPixel;
  TileLayer: {
    Satellite: typeof AMapSatelliteTileLayer;
    RoadNet: typeof AMapRoadNetTileLayer;
  };
};
