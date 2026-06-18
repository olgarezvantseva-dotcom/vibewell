import { useEffect, useState } from 'react';

import type { Coordinates, WeatherCondition, WeatherSnapshot } from './types';

/** Tallinn city centre — used when the device location is unavailable. */
const TALLINN: Coordinates = { lat: 59.4329, lng: 24.7423 };

/**
 * Hourly forecast keyed by an ISO hour string (yyyy-mm-ddTHH). Open-Meteo is
 * a free, key-less forecast API, so this works on-device with no secrets.
 */
export interface HourlyForecast {
  /** Map of "yyyy-mm-ddTHH" -> snapshot. */
  byHour: Record<string, WeatherSnapshot>;
  fetchedAt: number;
}

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
let cache: { key: string; data: HourlyForecast } | null = null;
let inFlight: Promise<HourlyForecast> | null = null;

/** WMO weather code -> human label. */
function describeCode(code: number): string {
  if (code === 0) return 'Clear';
  if (code <= 2) return 'Partly cloudy';
  if (code === 3) return 'Overcast';
  if (code <= 48) return 'Fog';
  if (code <= 57) return 'Drizzle';
  if (code <= 67) return 'Rain';
  if (code <= 77) return 'Snow';
  if (code <= 82) return 'Rain showers';
  if (code <= 86) return 'Snow showers';
  return 'Thunderstorm';
}

/**
 * Classifies whether the weather is suitable for an outdoor event.
 * Conservative: rain/snow/storms or high wind/precip chance score "poor".
 */
function classify(
  code: number,
  precipChance: number,
  windKph: number,
  temperatureC: number,
): WeatherCondition {
  const isWet = code >= 51; // drizzle and worse
  if (isWet && precipChance >= 50) return 'poor';
  if (code >= 95) return 'poor'; // thunderstorm
  if (windKph >= 40) return 'poor';
  if (temperatureC <= 0) return 'poor';

  const mostlyClear = code <= 2;
  const comfortable = temperatureC >= 12 && temperatureC <= 28;
  if (mostlyClear && comfortable && precipChance < 25 && windKph < 25) return 'good';
  if (precipChance >= 35 || windKph >= 30 || temperatureC < 6) return 'poor';
  return 'mixed';
}

function hourKey(date: Date): string {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  const h = `${date.getHours()}`.padStart(2, '0');
  return `${y}-${m}-${d}T${h}`;
}

interface OpenMeteoResponse {
  hourly?: {
    time?: string[];
    temperature_2m?: number[];
    precipitation_probability?: number[];
    weather_code?: number[];
    wind_speed_10m?: number[];
  };
}

function isOpenMeteoResponse(value: unknown): value is OpenMeteoResponse {
  return typeof value === 'object' && value !== null;
}

/**
 * Fetches a 7-day hourly forecast for the given coordinates and builds an
 * hour-keyed lookup. Results are cached in-memory for CACHE_TTL_MS so repeated
 * scoring passes don't re-fetch.
 */
export async function fetchForecast(coords?: Coordinates | null): Promise<HourlyForecast> {
  const loc = coords ?? TALLINN;
  const key = `${loc.lat.toFixed(2)},${loc.lng.toFixed(2)}`;

  if (cache && cache.key === key && Date.now() - cache.data.fetchedAt < CACHE_TTL_MS) {
    return cache.data;
  }
  if (inFlight) return inFlight;

  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lng}` +
    `&hourly=temperature_2m,precipitation_probability,weather_code,wind_speed_10m` +
    `&forecast_days=7&timezone=auto`;

  inFlight = (async () => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Weather request failed: ${res.status}`);
    const raw: unknown = await res.json();
    if (!isOpenMeteoResponse(raw)) throw new Error('Unexpected weather API response shape');
    const json: OpenMeteoResponse = raw;
    const hourly = json.hourly;
    const byHour: Record<string, WeatherSnapshot> = {};

    const times = hourly?.time ?? [];
    for (let i = 0; i < times.length; i++) {
      const time = times[i];
      const temperatureC = hourly?.temperature_2m?.[i] ?? 0;
      const precipitationChance = hourly?.precipitation_probability?.[i] ?? 0;
      const weatherCode = hourly?.weather_code?.[i] ?? 0;
      const windKph = hourly?.wind_speed_10m?.[i] ?? 0;
      // Open-Meteo "time" with timezone=auto is local wall-clock, e.g. "2026-06-18T14:00".
      const k = time.slice(0, 13);
      byHour[k] = {
        temperatureC: Math.round(temperatureC),
        precipitationChance: Math.round(precipitationChance),
        weatherCode,
        windKph: Math.round(windKph),
        label: describeCode(weatherCode),
        condition: classify(weatherCode, precipitationChance, windKph, temperatureC),
      };
    }

    const data: HourlyForecast = { byHour, fetchedAt: Date.now() };
    cache = { key, data };
    return data;
  })();

  try {
    return await inFlight;
  } finally {
    inFlight = null;
  }
}

/** Returns the forecast snapshot nearest the given time, or null if unknown. */
export function forecastAt(forecast: HourlyForecast | null, when: Date): WeatherSnapshot | null {
  if (!forecast) return null;
  const exact = forecast.byHour[hourKey(when)];
  if (exact) return exact;
  // Fall back to the closest available hour within ±2 hours.
  for (let offset = 1; offset <= 2; offset++) {
    const earlier = new Date(when.getTime() - offset * 3600_000);
    const later = new Date(when.getTime() + offset * 3600_000);
    const hit = forecast.byHour[hourKey(earlier)] ?? forecast.byHour[hourKey(later)];
    if (hit) return hit;
  }
  return null;
}

export type WeatherStatus = 'idle' | 'loading' | 'ready' | 'error';

interface WeatherHookResult {
  forecast: HourlyForecast | null;
  status: WeatherStatus;
}

/** Loads the hourly forecast for the user's location (or Tallinn fallback). */
export function useWeather(coords: Coordinates | null): WeatherHookResult {
  const [forecast, setForecast] = useState<HourlyForecast | null>(null);
  const [status, setStatus] = useState<WeatherStatus>('idle');

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    fetchForecast(coords)
      .then((data) => {
        if (cancelled) return;
        setForecast(data);
        setStatus('ready');
      })
      .catch(() => {
        if (cancelled) return;
        setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [coords]);

  return { forecast, status };
}
