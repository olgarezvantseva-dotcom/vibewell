import type {
  BudgetPreference,
  EnergyPreference,
  EventCategory,
  FamilyStatus,
  GroupPreference,
  Interest,
} from './types';

export const INTERESTS: { value: Interest; label: string; emoji: string }[] = [
  { value: 'yoga', label: 'Yoga', emoji: '🧘' },
  { value: 'meditation', label: 'Meditation', emoji: '🌬️' },
  { value: 'fitness', label: 'Fitness', emoji: '💪' },
  { value: 'running', label: 'Running', emoji: '🏃' },
  { value: 'nutrition', label: 'Nutrition', emoji: '🥗' },
  { value: 'art', label: 'Art', emoji: '🎨' },
  { value: 'music', label: 'Music', emoji: '🎵' },
  { value: 'nature', label: 'Nature', emoji: '🌲' },
  { value: 'social', label: 'Social', emoji: '🤝' },
  { value: 'mindfulness', label: 'Mindfulness', emoji: '✨' },
  { value: 'breathwork', label: 'Breathwork', emoji: '🌊' },
  { value: 'dance', label: 'Dance', emoji: '💃' },
  { value: 'reading', label: 'Reading', emoji: '📚' },
  { value: 'cooking', label: 'Cooking', emoji: '🍳' },
  { value: 'therapy', label: 'Therapy', emoji: '🛋️' },
];

export const FAMILY_OPTIONS: { value: FamilyStatus; label: string; description: string }[] = [
  { value: 'solo', label: 'Solo', description: 'Just me right now' },
  { value: 'couple', label: 'Couple', description: 'Me and a partner' },
  { value: 'parent', label: 'Parent', description: 'I have kids at home' },
  { value: 'caregiver', label: 'Caregiver', description: 'I care for family members' },
];

export const ENERGY_PREF_OPTIONS: { value: EnergyPreference; label: string }[] = [
  { value: 'low', label: 'Gentle & restorative' },
  { value: 'balanced', label: 'A nice balance' },
  { value: 'high', label: 'High energy' },
];

export const GROUP_PREF_OPTIONS: { value: GroupPreference; label: string }[] = [
  { value: 'solo', label: 'On my own' },
  { value: 'small', label: 'Small groups' },
  { value: 'large', label: 'Big crowds' },
  { value: 'any', label: 'No preference' },
];

export const BUDGET_PREF_OPTIONS: { value: BudgetPreference; label: string }[] = [
  { value: 'free', label: 'Free only' },
  { value: 'low', label: 'Budget friendly' },
  { value: 'any', label: 'Any price' },
];

export const CATEGORY_LABELS: Record<EventCategory, string> = {
  movement: 'Movement',
  mind: 'Mind',
  social: 'Social',
  creative: 'Creative',
  outdoor: 'Outdoor',
  family: 'Family',
};

export const CHECKIN_DIMENSIONS = [
  {
    key: 'energy' as const,
    label: 'Energy',
    low: 'Drained',
    high: 'Energized',
    emoji: '⚡',
  },
  {
    key: 'mood' as const,
    label: 'Mood',
    low: 'Low',
    high: 'Great',
    emoji: '🙂',
  },
  {
    key: 'stress' as const,
    label: 'Stress',
    low: 'Calm',
    high: 'Stressed',
    emoji: '🌪️',
  },
  {
    key: 'sleep' as const,
    label: 'Sleep',
    low: 'Poor',
    high: 'Rested',
    emoji: '🌙',
  },
];
