import { useMemo } from 'react';
import { Redirect, Stack, useRouter } from 'expo-router';
import { Heart, MapPin, RefreshCw } from 'lucide-react-native';
import { Button, Spinner, Surface, Text } from 'heroui-native';
import { ScrollView, View } from 'react-native';

import { EventCard } from '@/components/EventCard';
import { CHECKIN_DIMENSIONS } from '@/lib/constants';
import { deriveNeeds, NEED_LABELS, recommendEvents } from '@/lib/recommend';
import { todayKey, useCheckInStore, useProfileStore } from '@/lib/store';
import { useLocation } from '@/lib/useLocation';
import { useWeather } from '@/lib/weather';

export default function TodayScreen() {
  const router = useRouter();
  const profile = useProfileStore((s) => s.profile);
  const onboarded = useProfileStore((s) => s.onboarded);
  const hydrated = useProfileStore((s) => s.hydrated);
  const checkIns = useCheckInStore((s) => s.checkIns);
  const checkInsHydrated = useCheckInStore((s) => s.hydrated);
  const { coords, status, request } = useLocation();
  const { forecast } = useWeather(coords);

  const today = todayKey();
  const todaysCheckIn = useMemo(
    () => checkIns.find((c) => c.date === today) ?? null,
    [checkIns, today],
  );

  const recommendations = useMemo(() => {
    if (!profile) return [];
    return recommendEvents({ profile, checkIn: todaysCheckIn, coords, forecast });
  }, [profile, todaysCheckIn, coords, forecast]);

  const needs = useMemo(() => deriveNeeds(todaysCheckIn), [todaysCheckIn]);

  if (!hydrated || !checkInsHydrated) {
    return (
      <View className="bg-background flex-1 items-center justify-center">
        <Spinner />
      </View>
    );
  }

  if (!onboarded || !profile) {
    return <Redirect href="/onboarding" />;
  }

  const greeting = getGreeting();
  const topReason =
    needs.size > 0
      ? `Today we're focusing on ${[...needs].map((n) => NEED_LABELS[n]).join(' and ')}.`
      : "Here's what's good for you nearby.";

  return (
    <ScrollView
      className="bg-background"
      contentContainerClassName="pb-12"
      showsVerticalScrollIndicator={false}
    >
      <Stack.Screen options={{ title: 'Today' }} />

      <View className="gap-5 px-4 pt-2">
        <View>
          <Text className="text-muted text-sm">{greeting}</Text>
          <Text className="text-foreground text-2xl font-bold">
            {profile.name ? `Hi ${profile.name}` : 'How are you today?'}
          </Text>
        </View>

        {/* Check-in card */}
        {todaysCheckIn ? (
          <Surface variant="default" className="gap-3 rounded-2xl p-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-foreground font-semibold">Today&apos;s check-in</Text>
              <Button size="sm" variant="ghost" onPress={() => router.push('/checkin')}>
                <Button.Label>Update</Button.Label>
              </Button>
            </View>
            <View className="flex-row justify-between">
              {CHECKIN_DIMENSIONS.map((dim) => (
                <View key={dim.key} className="items-center gap-1">
                  <Text className="text-lg">{dim.emoji}</Text>
                  <Text className="text-muted text-xs">{dim.label}</Text>
                  <Text className="text-foreground text-sm font-semibold">
                    {todaysCheckIn[dim.key]}/5
                  </Text>
                </View>
              ))}
            </View>
            <Text className="text-foreground/80 text-sm">{topReason}</Text>
          </Surface>
        ) : (
          <Surface variant="default" className="gap-3 rounded-2xl p-5">
            <View className="flex-row items-center gap-2">
              <Heart size={18} color="#3f9d8b" />
              <Text className="text-foreground font-semibold">Start with a check-in</Text>
            </View>
            <Text className="text-muted text-sm">
              Tell us how you&apos;re feeling and we&apos;ll tune today&apos;s recommendations to
              your physical and mental state.
            </Text>
            <Button onPress={() => router.push('/checkin')}>
              <Button.Label>Do today&apos;s check-in</Button.Label>
            </Button>
          </Surface>
        )}

        {/* Location status */}
        <View className="flex-row items-center gap-2 px-1">
          <MapPin size={14} color="#7a8a85" />
          <Text className="text-muted flex-1 text-xs">
            {status === 'granted' && coords
              ? `Showing events within ${profile.maxDistanceKm} km of you`
              : status === 'loading'
                ? 'Finding events near you…'
                : 'Location off — showing events without distance ranking'}
          </Text>
          {status === 'denied' || status === 'error' ? (
            <Button size="sm" variant="ghost" onPress={() => void request()}>
              <Button.Label>Enable</Button.Label>
            </Button>
          ) : null}
        </View>

        {/* Recommendations */}
        <View className="gap-1">
          <Text className="text-foreground text-lg font-bold">Recommended for you</Text>
          <Text className="text-muted text-sm">Ranked by your state, interests and location</Text>
        </View>

        <View className="gap-4">
          {recommendations.slice(0, 8).map((rec, i) => (
            <EventCard
              key={rec.event.id}
              recommendation={rec}
              rank={i + 1}
              onPress={() => router.push({ pathname: '/event/[id]', params: { id: rec.event.id } })}
            />
          ))}
        </View>

        {recommendations.length === 0 ? (
          <View className="items-center gap-2 py-8">
            <RefreshCw size={20} color="#7a8a85" />
            <Text className="text-muted text-sm">No upcoming events match right now.</Text>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}
