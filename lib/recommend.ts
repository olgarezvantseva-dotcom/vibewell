import { EVENTS } from './events';
import { distanceKm } from './useLocation';
import type { CheckIn, Coordinates, Recommendation, UserProfile, WellnessEvent } from './types';

/**
 * Derives the user's current wellness "needs" from a check-in.
 * Each need maps to event.helpsWith entries that the engine rewards.
 */
function deriveNeeds(checkIn: CheckIn | null): Set<string> {
  const needs = new Set<string>();
  if (!checkIn) return needs;
  if (checkIn.energy <= 2) needs.add('low-energy');
  if (checkIn.stress >= 4) needs.add('high-stress');
  if (checkIn.mood <= 2) needs.add('low-mood');
  if (checkIn.sleep <= 2) needs.add('poor-sleep');
  return needs;
}

const NEED_LABELS: Record<string, string> = {
  'low-energy': 'a gentle lift in energy',
  'high-stress': 'help winding down',
  'low-mood': 'a mood boost',
  'poor-sleep': 'better rest tonight',
  'social-need': 'connection with others',
};

/** Maps the user's preferred energy to event intensities they'll enjoy. */
function intensityFit(profile: UserProfile, event: WellnessEvent, needsCalm: boolean): number {
  if (needsCalm && event.intensity === 'restorative') return 1;
  if (profile.energyPreference === 'low' && event.intensity === 'restorative') return 1;
  if (profile.energyPreference === 'high' && event.intensity === 'energizing') return 1;
  if (profile.energyPreference === 'balanced' && event.intensity === 'moderate') return 1;
  return 0;
}

interface ScoreInput {
  profile: UserProfile;
  checkIn: CheckIn | null;
  coords: Coordinates | null;
}

export function scoreEvent(event: WellnessEvent, input: ScoreInput): Recommendation {
  const { profile, checkIn, coords } = input;
  const reasons: string[] = [];
  let score = 0;

  const needs = deriveNeeds(checkIn);
  const needsCalm = needs.has('high-stress') || needs.has('poor-sleep');

  // 1. Matches current state needs (strongest signal).
  for (const help of event.helpsWith) {
    if (needs.has(help)) {
      score += 30;
      const label = NEED_LABELS[help];
      if (label) reasons.push(`Good for ${label}`);
    }
  }

  // 2. Interest overlap.
  const matchedInterests = event.tags.filter((t) => profile.interests.includes(t));
  if (matchedInterests.length > 0) {
    score += Math.min(matchedInterests.length * 12, 30);
    reasons.push(`Matches your interest in ${matchedInterests[0]}`);
  }

  // 3. Energy / intensity preference fit.
  if (intensityFit(profile, event, needsCalm)) {
    score += 15;
    if (needsCalm && event.intensity === 'restorative') {
      reasons.push('A calmer pace, which suits how you feel today');
    } else {
      reasons.push('Matches the energy level you enjoy');
    }
  }

  // 4. Group size preference.
  if (
    profile.groupPreference === 'any' ||
    event.groupSize === 'any' ||
    profile.groupPreference === event.groupSize
  ) {
    score += 8;
  } else {
    score -= 4;
  }

  // 5. Budget preference.
  if (profile.budgetPreference === 'free') {
    if (event.price === 0) score += 12;
    else score -= 20;
  } else if (profile.budgetPreference === 'low') {
    if (event.price <= 15) score += 8;
    else score -= 8;
  }
  if (event.price === 0 && profile.budgetPreference !== 'free') {
    reasons.push('Free to attend');
  }

  // 6. Family status fit.
  if (
    (profile.familyStatus === 'parent' || profile.familyStatus === 'caregiver') &&
    event.familyFriendly
  ) {
    score += 14;
    reasons.push('Family friendly');
  }
  if (
    (profile.familyStatus === 'parent' || profile.familyStatus === 'caregiver') &&
    !event.familyFriendly &&
    (event.intensity === 'energizing' || event.durationMin > 120)
  ) {
    score -= 6;
  }
  if (profile.familyStatus === 'solo' && event.helpsWith.includes('social-need')) {
    score += 6;
  }

  // 7. Distance.
  let dist: number | null = null;
  if (coords) {
    dist = distanceKm(coords, { lat: event.lat, lng: event.lng });
    if (dist <= profile.maxDistanceKm) {
      // Closer is better, scaled within the allowed radius.
      score += Math.max(0, 18 - (dist / profile.maxDistanceKm) * 18);
      if (dist <= profile.maxDistanceKm * 0.4) {
        reasons.push(`Only ${dist.toFixed(1)} km away`);
      }
    } else {
      score -= 25;
    }
  }

  return { event, score: Math.round(score), distanceKm: dist, reasons: reasons.slice(0, 3) };
}

export function recommendEvents(input: ScoreInput): Recommendation[] {
  const now = Date.now();
  return EVENTS.filter((e) => new Date(e.startsAt).getTime() > now)
    .map((event) => scoreEvent(event, input))
    .sort((a, b) => b.score - a.score);
}

export { NEED_LABELS, deriveNeeds };
