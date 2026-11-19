import { Geolocation } from '@capacitor/geolocation';

export interface GeoLocationPoint {
  lat: number;
  lng: number;
  accuracy?: number;
}

export interface RouteStop<T> {
  item: T;
  stopNumber: number;
  distanceFromPreviousKm: number;
  totalDistanceKm: number;
}

/**
 * Calculates straight-line surface distance between two coordinates in kilometers using Haversine formula.
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (lat1 === lat2 && lon1 === lon2) return 0;

  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

/**
 * Computes the optimal visit order for today's due households using nearest-neighbour routing
 * starting from the worker's current location or first household.
 * Pure, offline calculation with no external routing API needed.
 */
export function computeNearestNeighbourRoute<T extends { geo?: { lat: number; lng: number } | null }>(
  start: { lat: number; lng: number },
  items: T[]
): RouteStop<T>[] {
  const validItems = items.filter(
    (item) => item.geo && typeof item.geo.lat === 'number' && typeof item.geo.lng === 'number'
  );

  const stops: RouteStop<T>[] = [];
  const remaining = [...validItems];
  let currentPos = start;
  let totalDist = 0;
  let stopNum = 1;

  while (remaining.length > 0) {
    let nearestIdx = 0;
    let minDist = Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const d = calculateDistanceKm(
        currentPos.lat,
        currentPos.lng,
        remaining[i].geo!.lat,
        remaining[i].geo!.lng
      );
      if (d < minDist) {
        minDist = d;
        nearestIdx = i;
      }
    }

    const nextStop = remaining.splice(nearestIdx, 1)[0];
    totalDist += minDist;
    stops.push({
      item: nextStop,
      stopNumber: stopNum++,
      distanceFromPreviousKm: Math.round(minDist * 100) / 100,
      totalDistanceKm: Math.round(totalDist * 100) / 100,
    });
    currentPos = nextStop.geo!;
  }

  return stops;
}

/**
 * Obtains current GPS coordinates if user has consented.
 * Never throws and never blocks app execution if GPS is unavailable or denied.
 * Rounds to 2 decimal places (~1.1 km precision) if precision is set to 'village'.
 */
export async function getCurrentLocation(
  precision: 'exact' | 'village' = 'exact'
): Promise<GeoLocationPoint | null> {
  try {
    let rawLat: number;
    let rawLng: number;
    let accuracy: number;

    const isCapacitor = typeof window !== 'undefined' && (window as any).Capacitor?.isNativePlatform?.();

    if (isCapacitor) {
      const pos = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 30000,
      });
      rawLat = pos.coords.latitude;
      rawLng = pos.coords.longitude;
      accuracy = Math.round(pos.coords.accuracy || 10);
    } else if (typeof navigator !== 'undefined' && navigator.geolocation) {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 30000,
        });
      });
      rawLat = pos.coords.latitude;
      rawLng = pos.coords.longitude;
      accuracy = Math.round(pos.coords.accuracy || 10);
    } else {
      return null;
    }

    if (precision === 'village') {
      return {
        lat: Math.round(rawLat * 100) / 100,
        lng: Math.round(rawLng * 100) / 100,
        accuracy: Math.max(accuracy, 1000),
      };
    }

    return {
      lat: Math.round(rawLat * 10000) / 10000,
      lng: Math.round(rawLng * 10000) / 10000,
      accuracy,
    };
  } catch (err) {
    console.warn('Geolocation capture unavailable or denied:', err);
    return null;
  }
}

/**
 * Opens navigation in native phone maps app or web Google Maps without sending data to external LLMs.
 */
export function openNavigationApp(lat: number, lng: number, label?: string): void {
  const isCapacitor = typeof window !== 'undefined' && (window as any).Capacitor?.isNativePlatform?.();
  const encodedLabel = encodeURIComponent(label || 'Beneficiary Household');

  if (isCapacitor) {
    // Open Android / iOS native map intent
    window.open(`geo:${lat},${lng}?q=${lat},${lng}(${encodedLabel})`, '_system');
  } else {
    // Open web browser map
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  }
}
