import { useState } from 'react';
import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { Button, Input, Label, Text, TextField, useThemeColor } from 'heroui-native';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';

import { CHECKIN_DIMENSIONS } from '@/lib/constants';
import { todayKey, useCheckInStore } from '@/lib/store';
import type { CheckIn } from '@/lib/types';
import { cn } from '@/lib/utils';

const SCALE = [1, 2, 3, 4, 5];

export default function CheckInScreen() {
  const router = useRouter();
  const addCheckIn = useCheckInStore((s) => s.addCheckIn);
  const checkIns = useCheckInStore((s) => s.checkIns);
  const [background] = useThemeColor(['background']);

  const existing = checkIns.find((c) => c.date === todayKey());

  const [values, setValues] = useState({
    energy: existing?.energy ?? 3,
    mood: existing?.mood ?? 3,
    stress: existing?.stress ?? 3,
    sleep: existing?.sleep ?? 3,
  });
  const [note, setNote] = useState(existing?.note ?? '');

  const save = () => {
    const checkIn: CheckIn = {
      date: todayKey(),
      ...values,
      note: note.trim() || undefined,
    };
    addCheckIn(checkIn);
    router.back();
  };

  return (
    <View className="flex-1" style={{ backgroundColor: background }}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View className="pt-safe-offset-4 flex-row items-center justify-between px-4 pb-2">
          <Text className="text-foreground text-xl font-bold">Daily check-in</Text>
          <Pressable onPress={() => router.back()} className="p-1">
            <X size={24} color="#998790" />
          </Pressable>
        </View>

        <ScrollView
          contentContainerClassName="px-4 pb-8 gap-6"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text className="text-muted text-sm">
            Slide through how you feel right now. We&apos;ll tune today&apos;s recommendations to
            match.
          </Text>

          {CHECKIN_DIMENSIONS.map((dim) => (
            <View key={dim.key} className="gap-2">
              <View className="flex-row items-center justify-between">
                <Text className="text-foreground font-semibold">
                  {dim.emoji} {dim.label}
                </Text>
                <Text className="text-muted text-xs">
                  {dim.low} → {dim.high}
                </Text>
              </View>
              <View className="flex-row gap-2">
                {SCALE.map((n) => {
                  const active = values[dim.key] === n;
                  return (
                    <Pressable
                      key={n}
                      className="flex-1"
                      onPress={() => setValues((v) => ({ ...v, [dim.key]: n }))}
                    >
                      <View
                        className={cn(
                          'h-12 items-center justify-center rounded-xl border',
                          active ? 'bg-accent border-accent' : 'bg-surface border-border',
                        )}
                      >
                        <Text
                          className={cn(
                            'text-base font-semibold',
                            active ? 'text-accent-foreground' : 'text-foreground',
                          )}
                        >
                          {n}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}

          <TextField>
            <Label>Anything on your mind? (optional)</Label>
            <Input
              placeholder="A quick note for yourself"
              value={note}
              onChangeText={setNote}
              multiline
            />
          </TextField>

          <Button onPress={save}>
            <Button.Label>Save check-in</Button.Label>
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
