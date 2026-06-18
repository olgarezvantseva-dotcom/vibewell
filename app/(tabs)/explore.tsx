import { useMemo, useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import { Spinner, Text } from 'heroui-native';
import { FlashList } from '@shopify/flash-list';
import { View } from 'react-native';

import { EventCard } from '@/components/EventCard';
import { SelectChip } from '@/components/SelectChip';
import { CATEGORY_LABELS } from '@/lib/constants';
import { recommendEvents } from '@/lib/recommend';
import { todayKey, useCheckInStore, useProfileStore } from '@/lib/store';
import { useLocation } from '@/lib/useLocation';
import type { EventCategory, Recommendation } from '@/lib/types';

type Filter = 'all' | EventCategory;

const FILTERS: Filter[] = ['all', 'movement', 'mind', 'social', 'creative', 'outdoor', 'family'];

export default function ExploreScreen() {
  const router = useRouter();
  const profile = useProfileStore((s) => s.profile);
  const hydrated = useProfileStore((s) => s.hydrated);
  const checkIns = useCheckInStore((s) => s.checkIns);
  const { coords } = useLocation();
  const [filter, setFilter] = useState<Filter>('all');

  const todaysCheckIn = useMemo(
    () => checkIns.find((c) => c.date === todayKey()) ?? null,
    [checkIns],
  );

  const recommendations = useMemo<Recommendation[]>(() => {
    if (!profile) return [];
    const all = recommendEvents({ profile, checkIn: todaysCheckIn, coords });
    if (filter === 'all') return all;
    return all.filter((r) => r.event.category === filter);
  }, [profile, todaysCheckIn, coords, filter]);

  if (!hydrated || !profile) {
    return (
      <View className="bg-background flex-1 items-center justify-center">
        <Spinner />
      </View>
    );
  }

  return (
    <View className="bg-background flex-1">
      <Stack.Screen options={{ title: 'Explore' }} />
      <FlashList
        data={recommendations}
        keyExtractor={(item) => item.event.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        ListHeaderComponent={
          <View className="gap-3 pt-2 pb-4">
            <Text className="text-muted text-sm">
              Browse every upcoming event, sorted by your fit.
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {FILTERS.map((f) => (
                <SelectChip
                  key={f}
                  label={f === 'all' ? 'All' : CATEGORY_LABELS[f]}
                  selected={filter === f}
                  onPress={() => setFilter(f)}
                />
              ))}
            </View>
          </View>
        }
        ListEmptyComponent={
          <View className="items-center py-12">
            <Text className="text-muted text-sm">No events in this category yet.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View className="pb-4">
            <EventCard
              recommendation={item}
              onPress={() =>
                router.push({ pathname: '/event/[id]', params: { id: item.event.id } })
              }
            />
          </View>
        )}
      />
    </View>
  );
}
