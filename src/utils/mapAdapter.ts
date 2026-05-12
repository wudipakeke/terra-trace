export interface MapAdapter {
  latLngToPixel(map: any, lat: number, lng: number): { x: number; y: number };
  pixelToLatLng(map: any, x: number, y: number): { lat: number; lng: number };
  getContainer(map: any): HTMLElement;
}

export const maplibreAdapter: MapAdapter = {
  latLngToPixel(map: any, lat: number, lng: number) {
    const pt = map.project([lng, lat]);
    return { x: pt.x, y: pt.y };
  },
  pixelToLatLng(map: any, x: number, y: number) {
    const ll = map.unproject([x, y]);
    return { lat: ll.lat, lng: ll.lng };
  },
  getContainer(map: any) {
    return map.getContainer();
  },
};

export function getAdapter(): MapAdapter {
  return maplibreAdapter;
}
