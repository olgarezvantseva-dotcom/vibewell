import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';

import type { Coordinates } from './types';

export type LocationStatus = 'idle' | 'loading' | 'granted' | 'denied' | 'error';

interface LocationResult {
  coords: Coordinates | null;
  status: LocationStatus;
  request: () => Promise<void>;
}

/**
 * Requests foreground location permission and resolves the device's
 * current coordinates. Falls back gracefully if denied or unavailable.
 */
export function useLocation(): LocationResult {
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [status, setStatus] = useState<LocationStatus>('idle');

  const request = useCallback(async () => {
    setStatus('loading');
    try {
      const { status: perm } = await Location.requestForegroundPermissionsAsync();
      if ((perm as string) !== 'granted') {
        setStatus('denied');
        return;
      }
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
      setStatus('granted');
    } catch {
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    void request();
  }, [request]);

  return { coords, status, request };
}

/** Haversine distance between two coordinates in kilometers. */
export function distanceKm(a: Coordinates, b: Coordinates): number {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return R * 2 * Math.asin(Math.min(1, Math.sqrt(h)));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}
