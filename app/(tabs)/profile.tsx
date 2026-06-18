import { useMemo, useState } from 'react';
import { Stack } from 'expo-router';
import { Button, Spinner, Surface, Text } from 'heroui-native';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

import { PreferenceForm } from '@/components/PreferenceForm';
import { CHECKIN_DIMENSIONS } from '@/lib/constants';
import { DEFAULT_PROFILE, useCheckInStore, useProfileStore } from '@/lib/store';
import type { UserProfile } from '@/lib/types';

export default function ProfileScreen() {
  const profile = useProfileStore((s) => s.profile);
  const hydrated = useProfileStore((s) => s.hydrated);
  const updateProfile = useProfileStore((s) => s.updateProfile);
  const checkIns = useCheckInStore((s) => s.checkIns);

  const [draft, setDraft] = useState<UserProfile>(profile ?? DEFAULT_PROFILE);
  const [saved, setSaved] = useState(false);

  const recent = useMemo(() => checkIns.slice(0, 5), [checkIns]);

  if (!hydrated) {
    return (
      <View className="bg-background flex-1 items-center justify-center">
        <Spinner />
      </View>
    );
  }

  const onChange = (patch: Partial<UserProfile>) => {
    setDraft((d) => ({ ...d, ...patch }));
    setSaved(false);
  };

  const save = () => {
    updateProfile(draft);
    setSaved(true);
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        className="bg-background"
        contentContainerClassName="px-4 pb-12 pt-2 gap-6"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Stack.Screen options={{ title: 'You' }} />

        {recent.length > 0 ? (
          <Surface variant="default" className="gap-3 rounded-2xl p-4">
            <Text className="text-foreground font-semibold">Recent check-ins</Text>
            <View className="gap-2">
              {recent.map((c) => (
                <View key={c.date} className="flex-row items-center justify-between">
                  <Text className="text-muted text-sm">{c.date}</Text>
                  <View className="flex-row gap-3">
                    {CHECKIN_DIMENSIONS.map((dim) => (
                      <Text key={dim.key} className="text-foreground text-xs">
                        {dim.emoji} {c[dim.key]}
                      </Text>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          </Surface>
        ) : null}

        <PreferenceForm draft={draft} onChange={onChange} />

        <Button onPress={save}>
          <Button.Label>{saved ? 'Saved ✓' : 'Save preferences'}</Button.Label>
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
