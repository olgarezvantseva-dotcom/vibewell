import { INTERESTS } from './constants';
import { EVENTS } from './events';
import { deriveNeeds, NEED_LABELS, recommendEvents } from './recommend';
import type {
  CheckIn,
  Coordinates,
  Interest,
  Recommendation,
  UserProfile,
  WellnessEvent,
} from './types';
import type { HourlyForecast } from './weather';

export interface AgentContext {
  profile: UserProfile | null;
  checkIn: CheckIn | null;
  coords: Coordinates | null;
  forecast: HourlyForecast | null;
}

export interface AgentReply {
  text: string;
  eventIds?: string[];
}

/** Category keywords the user might mention, mapped to event categories/interests. */
const TOPIC_KEYWORDS: { keywords: string[]; interests: Interest[] }[] = [
  { keywords: ['yoga', 'stretch'], interests: ['yoga'] },
  {
    keywords: ['meditat', 'mindful', 'calm', 'breath'],
    interests: ['meditation', 'mindfulness', 'breathwork'],
  },
  { keywords: ['run', 'cardio', 'jog'], interests: ['running'] },
  { keywords: ['workout', 'gym', 'fitness', 'strength'], interests: ['fitness'] },
  { keywords: ['food', 'nutrition', 'eat', 'cook'], interests: ['nutrition', 'cooking'] },
  { keywords: ['art', 'paint', 'craft', 'creative'], interests: ['art'] },
  { keywords: ['music', 'concert', 'sing'], interests: ['music'] },
  { keywords: ['nature', 'outdoor', 'park', 'hike', 'walk'], interests: ['nature'] },
  { keywords: ['social', 'people', 'friend', 'meet', 'lonely'], interests: ['social'] },
  { keywords: ['dance', 'dancing'], interests: ['dance'] },
  { keywords: ['read', 'book'], interests: ['reading'] },
  { keywords: ['therapy', 'counsel', 'talk'], interests: ['therapy'] },
];

/** Lightweight wellness guidance keyed by detected need. */
const WELLNESS_TIPS: Record<string, string[]> = {
  'high-stress': [
    'Try a 4-7-8 breath: inhale for 4, hold for 7, exhale for 8. Three rounds can take the edge off.',
    'A short walk outside — even 10 minutes — lowers cortisol and resets a busy mind.',
  ],
  'low-energy': [
    'Gentle movement beats none. A slow stretch or restorative class can lift energy without draining you.',
    'Hydrate and step into daylight for a few minutes — both nudge your energy up naturally.',
  ],
  'low-mood': [
    'Connection helps mood more than almost anything. A small, low-pressure group activity is a good start.',
    'Doing one creative or playful thing today, however small, reliably nudges mood upward.',
  ],
  'poor-sleep': [
    'Keep today calm and avoid intense evening workouts — a restorative session protects tonight’s sleep.',
    'Wind down with dim light and no screens an hour before bed to recover from a rough night.',
  ],
};

function topInterestLabel(interests: Interest[]): string | null {
  if (interests.length === 0) return null;
  const found = INTERESTS.find((i) => i.value === interests[0]);
  return found ? found.label.toLowerCase() : interests[0];
}

function listEvents(recs: Recommendation[], limit: number): { text: string; ids: string[] } {
  const top = recs.slice(0, limit);
  const ids = top.map((r) => r.event.id);
  const lines = top.map((r, i) => {
    const reason = r.reasons[0] ? ` — ${r.reasons[0].toLowerCase()}` : '';
    const dist = r.distanceKm != null ? ` (${r.distanceKm.toFixed(1)} km)` : '';
    return `${i + 1}. ${r.event.title}${dist}${reason}`;
  });
  return { text: lines.join('\n'), ids };
}

function matchTopic(text: string): Interest[] {
  const lower = text.toLowerCase();
  const matched = new Set<Interest>();
  for (const topic of TOPIC_KEYWORDS) {
    if (topic.keywords.some((k) => lower.includes(k))) {
      topic.interests.forEach((i) => matched.add(i));
    }
  }
  return [...matched];
}

function filterByInterests(recs: Recommendation[], interests: Interest[]): Recommendation[] {
  if (interests.length === 0) return recs;
  const matches = recs.filter((r) => r.event.tags.some((t) => interests.includes(t)));
  return matches.length > 0 ? matches : recs;
}

function freeEvents(recs: Recommendation[]): Recommendation[] {
  return recs.filter((r) => r.event.price === 0);
}

function outdoorEvents(recs: Recommendation[]): Recommendation[] {
  return recs.filter((r) => r.event.outdoor);
}

/**
 * Produces an on-device agent reply. No network; uses the existing recommendation
 * engine plus the user's check-in to tailor wellness guidance.
 */
export function generateReply(message: string, ctx: AgentContext): AgentReply {
  const text = message.trim();
  const lower = text.toLowerCase();

  if (!ctx.profile) {
    return {
      text: "Let's finish setting up your profile first so I can tailor suggestions — head to the onboarding screen.",
    };
  }

  const recs = recommendEvents({
    profile: ctx.profile,
    checkIn: ctx.checkIn,
    coords: ctx.coords,
    forecast: ctx.forecast,
  });
  const needs = [...deriveNeeds(ctx.checkIn)];

  // Greetings / help.
  if (/^(hi|hey|hello|yo|hallo|tere)\b/.test(lower) || lower.length === 0) {
    const name = ctx.profile.name ? ` ${ctx.profile.name}` : '';
    return {
      text: `Hi${name}! I'm your Bloom coach. Ask me for event ideas ("any yoga this week?"), wellness tips, or what suits how you feel today.`,
    };
  }

  // Wellness tips / how-do-I-feel questions.
  const wantsTip =
    /\b(tip|advice|help me|how (do|can) i|feel|stress|anxious|tired|exhaust|sleep|sad|down|mood|relax|calm)\b/.test(
      lower,
    );
  const wantsEvents =
    /\b(event|class|workshop|recommend|suggest|do|attend|going on|near|today|week|free|outdoor)\b/.test(
      lower,
    );

  if (wantsTip && !wantsEvents) {
    if (needs.length > 0) {
      const need = needs[0];
      const tips = WELLNESS_TIPS[need] ?? [];
      const tip = tips[Math.floor(Math.random() * tips.length)] ?? '';
      const top = listEvents(filterByInterests(recs, []), 2);
      return {
        text: `Based on today's check-in you could use ${NEED_LABELS[need] ?? 'some care'}. ${tip}\n\nIf you'd like to get out, these fit:\n${top.text}`,
        eventIds: top.ids,
      };
    }
    return {
      text: "A simple reset: take three slow breaths, drink some water, and step outside for a few minutes. Want me to suggest an event that matches your mood? Just tell me how you're feeling or do today's check-in.",
    };
  }

  // Topic-specific event requests.
  const topicInterests = matchTopic(lower);
  if (topicInterests.length > 0) {
    const filtered = filterByInterests(recs, topicInterests);
    if (filtered.length === 0) {
      return {
        text: `I couldn't find upcoming ${topInterestLabel(topicInterests)} events right now. Want me to suggest something close instead?`,
      };
    }
    const { text: body, ids } = listEvents(filtered, 3);
    return {
      text: `Here are ${topInterestLabel(topicInterests)} options coming up:\n${body}\n\nTap one to see details and book.`,
      eventIds: ids,
    };
  }

  // Free events.
  if (/\bfree\b/.test(lower)) {
    const free = freeEvents(recs);
    if (free.length === 0) return { text: "I don't see any free events upcoming right now." };
    const { text: body, ids } = listEvents(free, 3);
    return { text: `Free to attend:\n${body}`, eventIds: ids };
  }

  // Outdoor / weather.
  if (/\b(outdoor|outside|weather|sun|rain)\b/.test(lower)) {
    const out = outdoorEvents(recs);
    if (out.length === 0)
      return { text: 'No outdoor events match right now — happy to suggest indoor ones.' };
    const { text: body, ids } = listEvents(out, 3);
    const w = out[0]?.weather;
    const weatherNote = w
      ? ` Forecast for the top pick: ${w.temperatureC}°C, ${w.label.toLowerCase()}.`
      : '';
    return { text: `Outdoor picks:\n${body}\n${weatherNote}`, eventIds: ids };
  }

  // General recommendations / fallback.
  if (recs.length === 0) {
    return {
      text: "There aren't any upcoming events matching your profile at the moment. Try widening your distance in your profile.",
    };
  }
  const { text: body, ids } = listEvents(recs, 3);
  const lead =
    needs.length > 0
      ? `Given how you're feeling, I'd focus on ${needs.map((n) => NEED_LABELS[n]).join(' and ')}. Top picks:`
      : "Here's what I'd recommend for you right now:";
  return { text: `${lead}\n${body}\n\nTap any event to see details.`, eventIds: ids };
}

export function eventById(id: string): WellnessEvent | undefined {
  return EVENTS.find((e) => e.id === id);
}

export const AGENT_GREETING =
  "Hi! I'm your Bloom wellness coach. Ask me for event ideas, a wellness tip, or what suits how you feel today.";
