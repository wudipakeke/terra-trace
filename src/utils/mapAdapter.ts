export interface MapAdapter {
  latLngToPixel(map: any, lat: number, lng: number): { x: number; y: number };
  pixelToLatLng(map: any, x: number, y: number): { lat: number; lng: number };
  getContainer(map: any): HTMLElement;
}

export const amapAdapter: MapAdapter = {
  latLngToPixel(map: any, lat: number, lng: number) {
    const pixel = (map as AMap.Map).lngLatToPixel(new AMap.LngLat(lng, lat));
    return { x: pixel.getX(), y: pixel.getY() };
  },
  pixelToLatLng(map: any, x: number, y: number) {
    const ll = (map as AMap.Map).pixelToLngLat(new AMap.Pixel(x, y));
    return { lat: ll.getLat(), lng: ll.getLng() };
  },
  getContainer(map: any) {
    return (map as AMap.Map).getContainer();
  },
};

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

export function getAdapter(provider: 'amap' | 'maplibre'): MapAdapter {
  return provider === 'amap' ? amapAdapter : maplibreAdapter;
}
