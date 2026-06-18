export type Interest =
  | 'yoga'
  | 'meditation'
  | 'fitness'
  | 'running'
  | 'nutrition'
  | 'art'
  | 'music'
  | 'nature'
  | 'social'
  | 'mindfulness'
  | 'breathwork'
  | 'dance'
  | 'reading'
  | 'cooking'
  | 'therapy';

export type FamilyStatus = 'solo' | 'couple' | 'parent' | 'caregiver';

export type EnergyPreference = 'low' | 'balanced' | 'high';
export type GroupPreference = 'solo' | 'small' | 'large' | 'any';
export type BudgetPreference = 'free' | 'low' | 'any';

export interface CheckIn {
  /** ISO date string (yyyy-mm-dd) */
  date: string;
  /** 1 (drained) - 5 (energized) */
  energy: number;
  /** 1 (low) - 5 (great) */
  mood: number;
  /** 1 (calm) - 5 (very stressed) */
  stress: number;
  /** 1 (poor) - 5 (rested) */
  sleep: number;
  note?: string;
}

export interface UserProfile {
  name: string;
  interests: Interest[];
  familyStatus: FamilyStatus;
  energyPreference: EnergyPreference;
  groupPreference: GroupPreference;
  budgetPreference: BudgetPreference;
  /** Max travel distance in km */
  maxDistanceKm: number;
}

export type EventCategory = 'movement' | 'mind' | 'social' | 'creative' | 'outdoor' | 'family';

export type EventIntensity = 'restorative' | 'moderate' | 'energizing';

export interface WellnessEvent {
  id: string;
  title: string;
  category: EventCategory;
  intensity: EventIntensity;
  tags: Interest[];
  /** Good for these states (the engine boosts when the user needs this) */
  helpsWith: ('low-energy' | 'high-stress' | 'low-mood' | 'poor-sleep' | 'social-need')[];
  description: string;
  venue: string;
  /** Coordinates of the venue */
  lat: number;
  lng: number;
  /** ISO datetime */
  startsAt: string;
  durationMin: number;
  price: number;
  groupSize: GroupPreference;
  familyFriendly: boolean;
  /** True when the event takes place outdoors (subject to weather). */
  outdoor: boolean;
  imageColor: string;
  /** External URL to register/book a place */
  registrationUrl: string;
}

export type WeatherCondition = 'good' | 'mixed' | 'poor';

export interface WeatherSnapshot {
  /** Temperature in °C at the event start hour. */
  temperatureC: number;
  /** Probability of precipitation (0-100) at the event start hour. */
  precipitationChance: number;
  /** Open-Meteo WMO weather code. */
  weatherCode: number;
  /** Wind speed in km/h. */
  windKph: number;
  /** Short human label, e.g. "Light rain". */
  label: string;
  /** Outdoor suitability classification. */
  condition: WeatherCondition;
}

export interface Recommendation {
  event: WellnessEvent;
  score: number;
  distanceKm: number | null;
  reasons: string[];
  /** Forecast at the event's start time (outdoor events only). */
  weather: WeatherSnapshot | null;
}

export interface Coordinates {
  lat: number;
  lng: number;
}
