import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Sparkles } from 'lucide-react-native';
import { Button, Input, Label, Text, TextField } from 'heroui-native';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

import { PreferenceForm } from '@/components/PreferenceForm';
import { DEFAULT_PROFILE, useProfileStore } from '@/lib/store';
import type { UserProfile } from '@/lib/types';

export default function OnboardingScreen() {
  const router = useRouter();
  const setProfile = useProfileStore((s) => s.setProfile);
  const completeOnboarding = useProfileStore((s) => s.completeOnboarding);

  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<UserProfile>(DEFAULT_PROFILE);

  const onChange = (patch: Partial<UserProfile>) => setDraft((d) => ({ ...d, ...patch }));

  const finish = () => {
    setProfile(draft);
    completeOnboarding();
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        className="bg-background"
        contentContainerClassName="px-5 pb-12 pt-safe-offset-8 gap-7"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-3">
          <View className="bg-soft-accent h-12 w-12 items-center justify-center rounded-2xl">
            <Sparkles size={24} color="#3f9d8b" />
          </View>
          <Text className="text-foreground text-3xl font-bold">Welcome to Bloom</Text>
          <Text className="text-muted text-base">
            We recommend events and workshops that fit how you feel, what you love, your life stage
            and where you are.
          </Text>
        </View>

        {step === 0 ? (
          <View className="gap-6">
            <TextField>
              <Label>What should we call you?</Label>
              <Input
                placeholder="Your first name"
                value={draft.name}
                onChangeText={(name) => onChange({ name })}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </TextField>
            <Button onPress={() => setStep(1)}>
              <Button.Label>Continue</Button.Label>
            </Button>
          </View>
        ) : (
          <View className="gap-7">
            <PreferenceForm draft={draft} onChange={onChange} />
            <View className="gap-2">
              <Button onPress={finish}>
                <Button.Label>Get started</Button.Label>
              </Button>
              <Button variant="ghost" onPress={() => setStep(0)}>
                <Button.Label>Back</Button.Label>
              </Button>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
