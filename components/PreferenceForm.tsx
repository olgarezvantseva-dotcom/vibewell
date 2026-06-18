import { Label, Radio, RadioGroup, Slider, Text } from 'heroui-native';
import { View } from 'react-native';

import { SelectChip } from '@/components/SelectChip';
import {
  BUDGET_PREF_OPTIONS,
  ENERGY_PREF_OPTIONS,
  FAMILY_OPTIONS,
  GROUP_PREF_OPTIONS,
  INTERESTS,
} from '@/lib/constants';
import type { Interest, UserProfile } from '@/lib/types';

interface Props {
  draft: UserProfile;
  onChange: (patch: Partial<UserProfile>) => void;
}

/** Shared editor for interests, family status and preferences. */
export function PreferenceForm({ draft, onChange }: Props) {
  const toggleInterest = (value: Interest) => {
    const exists = draft.interests.includes(value);
    onChange({
      interests: exists ? draft.interests.filter((i) => i !== value) : [...draft.interests, value],
    });
  };

  return (
    <View className="gap-6">
      <View className="gap-3">
        <View>
          <Text className="text-foreground font-semibold">Your interests</Text>
          <Text className="text-muted text-sm">Pick the things you&apos;d love to do more of.</Text>
        </View>
        <View className="flex-row flex-wrap gap-2">
          {INTERESTS.map((interest) => (
            <SelectChip
              key={interest.value}
              label={`${interest.emoji} ${interest.label}`}
              selected={draft.interests.includes(interest.value)}
              onPress={() => toggleInterest(interest.value)}
            />
          ))}
        </View>
      </View>

      <View className="gap-3">
        <Text className="text-foreground font-semibold">Family status</Text>
        <RadioGroup
          value={draft.familyStatus}
          onValueChange={(v) => {
            const option = FAMILY_OPTIONS.find((o) => o.value === v);
            if (option) onChange({ familyStatus: option.value });
          }}
        >
          {FAMILY_OPTIONS.map((opt, i) => (
            <RadioGroup.Item key={opt.value} value={opt.value} className={i > 0 ? 'mt-2' : ''}>
              <View>
                <Label>{opt.label}</Label>
                <Text className="text-muted text-xs">{opt.description}</Text>
              </View>
              <Radio />
            </RadioGroup.Item>
          ))}
        </RadioGroup>
      </View>

      <View className="gap-3">
        <Text className="text-foreground font-semibold">Preferred energy</Text>
        <View className="flex-row flex-wrap gap-2">
          {ENERGY_PREF_OPTIONS.map((opt) => (
            <SelectChip
              key={opt.value}
              label={opt.label}
              selected={draft.energyPreference === opt.value}
              onPress={() => onChange({ energyPreference: opt.value })}
            />
          ))}
        </View>
      </View>

      <View className="gap-3">
        <Text className="text-foreground font-semibold">Group size</Text>
        <View className="flex-row flex-wrap gap-2">
          {GROUP_PREF_OPTIONS.map((opt) => (
            <SelectChip
              key={opt.value}
              label={opt.label}
              selected={draft.groupPreference === opt.value}
              onPress={() => onChange({ groupPreference: opt.value })}
            />
          ))}
        </View>
      </View>

      <View className="gap-3">
        <Text className="text-foreground font-semibold">Budget</Text>
        <View className="flex-row flex-wrap gap-2">
          {BUDGET_PREF_OPTIONS.map((opt) => (
            <SelectChip
              key={opt.value}
              label={opt.label}
              selected={draft.budgetPreference === opt.value}
              onPress={() => onChange({ budgetPreference: opt.value })}
            />
          ))}
        </View>
      </View>

      <View className="gap-2">
        <View className="flex-row items-center justify-between">
          <Text className="text-foreground font-semibold">How far will you travel?</Text>
          <Text className="text-accent font-semibold">{Math.round(draft.maxDistanceKm)} km</Text>
        </View>
        <Slider
          value={draft.maxDistanceKm}
          minValue={1}
          maxValue={30}
          step={1}
          onChange={(v) => onChange({ maxDistanceKm: Array.isArray(v) ? v[0] : v })}
        >
          <Slider.Track>
            <Slider.Fill />
            <Slider.Thumb />
          </Slider.Track>
        </Slider>
      </View>
    </View>
  );
}
