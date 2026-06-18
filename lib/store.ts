import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { CheckIn, UserProfile } from './types';

interface ProfileState {
  profile: UserProfile | null;
  onboarded: boolean;
  hydrated: boolean;
  setProfile: (profile: UserProfile) => void;
  updateProfile: (patch: Partial<UserProfile>) => void;
  completeOnboarding: () => void;
  reset: () => void;
}

export const DEFAULT_PROFILE: UserProfile = {
  name: '',
  interests: [],
  familyStatus: 'solo',
  energyPreference: 'balanced',
  groupPreference: 'any',
  budgetPreference: 'any',
  maxDistanceKm: 10,
};

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profile: null,
      onboarded: false,
      hydrated: false,
      setProfile: (profile) => set({ profile }),
      updateProfile: (patch) =>
        set((state) => ({
          profile: { ...(state.profile ?? DEFAULT_PROFILE), ...patch },
        })),
      completeOnboarding: () => set({ onboarded: true }),
      reset: () => set({ profile: null, onboarded: false }),
    }),
    {
      name: 'wellness-profile',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ profile: state.profile, onboarded: state.onboarded }),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);

interface CheckInState {
  checkIns: CheckIn[];
  hydrated: boolean;
  addCheckIn: (checkIn: CheckIn) => void;
}

export const useCheckInStore = create<CheckInState>()(
  persist(
    (set) => ({
      checkIns: [],
      hydrated: false,
      addCheckIn: (checkIn) =>
        set((state) => {
          const others = state.checkIns.filter((c) => c.date !== checkIn.date);
          return { checkIns: [checkIn, ...others].sort((a, b) => (a.date < b.date ? 1 : -1)) };
        }),
    }),
    {
      name: 'wellness-checkins',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ checkIns: state.checkIns }),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);

export function todayKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
