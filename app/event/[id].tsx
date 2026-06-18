import { useMemo } from 'react';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { format } from 'date-fns';
import { Linking, Pressable, ScrollView, View } from 'react-native';
import {
  ArrowLeft,
  CloudRain,
  Clock,
  ExternalLink,
  MapPin,
  Sun,
  Users,
  Wallet,
} from 'lucide-react-native';
import { Button, Chip, Surface, Text } from 'heroui-native';

import MapView from '@/components/MapView';
import { CATEGORY_LABELS, INTERESTS } from '@/lib/constants';
import { EVENTS } from '@/lib/events';
import { scoreEvent } from '@/lib/recommend';
import { DEFAULT_PROFILE, todayKey, useCheckInStore, useProfileStore } from '@/lib/store';
import { useLocation } from '@/lib/useLocation';
import { useWeather } from '@/lib/weather';

const INTENSITY_LABEL: Record<string, string> = {
  restorative: 'Restorative',
  moderate: 'Moderate',
  energizing: 'Energizing',
};

const tagLabel = (t: string) => INTERESTS.find((i) => i.value === t)?.label ?? t;

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const profile = useProfileStore((s) => s.profile) ?? DEFAULT_PROFILE;
  const checkIns = useCheckInStore((s) => s.checkIns);
  const { coords } = useLocation();
  const { forecast } = useWeather(coords);

  const event = useMemo(() => EVENTS.find((e) => e.id === id), [id]);
  const todaysCheckIn = useMemo(
    () => checkIns.find((c) => c.date === todayKey()) ?? null,
    [checkIns],
  );

  const recommendation = useMemo(
    () => (event ? scoreEvent(event, { profile, checkIn: todaysCheckIn, coords, forecast }) : null),
    [event, profile, todaysCheckIn, coords, forecast],
  );

  if (!event || !recommendation) {
    return (
      <View className="bg-background flex-1 items-center justify-center">
        <Stack.Screen options={{ title: 'Event' }} />
        <Text className="text-muted">Event not found.</Text>
      </View>
    );
  }

  const start = new Date(event.startsAt);

  return (
    <View className="bg-background flex-1">
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerClassName="pb-12" showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[event.imageColor, `${event.imageColor}aa`]}
          style={{ height: 200 }}
        >
          <View className="pt-safe-offset-3 px-4">
            <Pressable
              onPress={() => router.back()}
              className="bg-surface/90 h-10 w-10 items-center justify-center rounded-full"
            >
              <ArrowLeft size={20} color="#2b3a35" />
            </Pressable>
          </View>
          <View className="flex-1 justify-end p-4">
            <Chip variant="soft" size="sm" className="mb-2 self-start">
              <Chip.Label>{CATEGORY_LABELS[event.category]}</Chip.Label>
            </Chip>
          </View>
        </LinearGradient>

        <View className="gap-5 px-4 pt-4">
          <View className="gap-1">
            <Text className="text-foreground text-2xl font-bold">{event.title}</Text>
            <Text className="text-muted">
              {INTENSITY_LABEL[event.intensity]} · {event.venue}
            </Text>
          </View>

          {recommendation.reasons.length > 0 ? (
            <Surface variant="default" className="gap-2 rounded-2xl p-4">
              <Text className="text-foreground font-semibold">Why this fits you</Text>
              {recommendation.reasons.map((reason) => (
                <View key={reason} className="flex-row items-center gap-2">
                  <View className="bg-accent h-1.5 w-1.5 rounded-full" />
                  <Text className="text-foreground/80 text-sm">{reason}</Text>
                </View>
              ))}
            </Surface>
          ) : null}

          {event.outdoor && recommendation.weather ? (
            <Surface variant="default" className="flex-row items-center gap-3 rounded-2xl p-4">
              {recommendation.weather.condition === 'poor' ? (
                <CloudRain size={22} color="#c2603f" />
              ) : (
                <Sun size={22} color="#3f9d8b" />
              )}
              <View className="flex-1">
                <Text className="text-foreground font-semibold">
                  Outdoor event · {recommendation.weather.label}
                </Text>
                <Text className="text-muted text-sm">
                  {recommendation.weather.temperatureC}°C ·{' '}
                  {recommendation.weather.precipitationChance}% chance of rain ·{' '}
                  {recommendation.weather.windKph} km/h wind
                </Text>
                <Text
                  className={
                    recommendation.weather.condition === 'poor'
                      ? 'text-sm text-[#c2603f]'
                      : 'text-accent text-sm'
                  }
                >
                  {recommendation.weather.condition === 'good'
                    ? 'Great conditions for an outdoor session.'
                    : recommendation.weather.condition === 'poor'
                      ? 'Weather may disrupt this — consider an indoor alternative.'
                      : 'Mixed conditions — keep an eye on the forecast.'}
                </Text>
              </View>
            </Surface>
          ) : null}

          <View className="flex-row flex-wrap gap-x-6 gap-y-3">
            <Detail
              icon={<Clock size={16} color="#3f9d8b" />}
              label={format(start, 'EEEE, MMM d · p')}
            />
            <Detail
              icon={<MapPin size={16} color="#3f9d8b" />}
              label={
                recommendation.distanceKm != null
                  ? `${recommendation.distanceKm.toFixed(1)} km · ${event.venue}`
                  : event.venue
              }
            />
            <Detail
              icon={<Wallet size={16} color="#3f9d8b" />}
              label={event.price === 0 ? 'Free' : `€${event.price}`}
            />
            <Detail icon={<Users size={16} color="#3f9d8b" />} label={`${event.durationMin} min`} />
          </View>

          <Text className="text-foreground/90 text-base leading-6">{event.description}</Text>

          <View className="flex-row flex-wrap gap-2">
            {event.tags.map((t) => (
              <Chip key={t} variant="secondary" size="sm">
                <Chip.Label>{tagLabel(t)}</Chip.Label>
              </Chip>
            ))}
          </View>

          <Surface variant="default" className="overflow-hidden rounded-2xl p-0">
            <MapView
              style={{ height: 180 }}
              scrollEnabled={false}
              zoomEnabled={false}
              initialRegion={{
                latitude: event.lat,
                longitude: event.lng,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
              }}
              markers={[
                {
                  id: event.id,
                  coordinate: { latitude: event.lat, longitude: event.lng },
                  title: event.venue,
                  color: 'green',
                },
              ]}
            />
          </Surface>

          <View className="gap-3">
            <Button onPress={() => void Linking.openURL(event.registrationUrl)}>
              <Button.Label>Register / Book a place</Button.Label>
              <ExternalLink size={18} color="#ffffff" />
            </Button>
            <Text className="text-muted text-center text-xs">
              Opens the organiser&apos;s booking page in your browser
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function Detail({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <View className="flex-row items-center gap-2">
      {icon}
      <Text className="text-foreground text-sm">{label}</Text>
    </View>
  );
}
