import { LinearGradient } from 'expo-linear-gradient';
import { Clock, MapPin } from 'lucide-react-native';
import { format } from 'date-fns';
import { Chip, Surface, Text } from 'heroui-native';
import { Pressable, View } from 'react-native';

import { CATEGORY_LABELS } from '@/lib/constants';
import type { Recommendation } from '@/lib/types';

interface Props {
  recommendation: Recommendation;
  onPress: () => void;
  rank?: number;
}

export function EventCard({ recommendation, onPress, rank }: Props) {
  const { event, reasons, distanceKm } = recommendation;
  const start = new Date(event.startsAt);

  return (
    <Pressable onPress={onPress}>
      <Surface variant="default" className="overflow-hidden rounded-2xl p-0">
        <LinearGradient
          colors={[event.imageColor, `${event.imageColor}99`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ height: 96 }}
        >
          <View className="flex-1 flex-row items-start justify-between p-3">
            <Chip variant="soft" size="sm">
              <Chip.Label>{CATEGORY_LABELS[event.category]}</Chip.Label>
            </Chip>
            {rank != null && rank <= 3 ? (
              <View className="bg-surface/90 rounded-full px-2 py-1">
                <Text className="text-foreground text-xs font-semibold">Top pick</Text>
              </View>
            ) : null}
          </View>
        </LinearGradient>

        <View className="gap-2 p-4">
          <Text className="text-foreground text-base font-semibold" numberOfLines={1}>
            {event.title}
          </Text>

          <View className="flex-row flex-wrap items-center gap-x-4 gap-y-1">
            <View className="flex-row items-center gap-1">
              <Clock size={13} color="#7a8a85" />
              <Text className="text-muted text-xs">{format(start, 'EEE p')}</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <MapPin size={13} color="#7a8a85" />
              <Text className="text-muted text-xs" numberOfLines={1}>
                {distanceKm != null ? `${distanceKm.toFixed(1)} km · ` : ''}
                {event.venue}
              </Text>
            </View>
          </View>

          {reasons.length > 0 ? (
            <View className="mt-1 gap-1">
              {reasons.slice(0, 2).map((reason) => (
                <View key={reason} className="flex-row items-center gap-2">
                  <View className="bg-accent h-1.5 w-1.5 rounded-full" />
                  <Text className="text-foreground/80 text-xs">{reason}</Text>
                </View>
              ))}
            </View>
          ) : null}

          <View className="mt-1 flex-row items-center justify-between">
            <Text className="text-foreground text-sm font-semibold">
              {event.price === 0 ? 'Free' : `£${event.price}`}
            </Text>
            <Text className="text-muted text-xs">{event.durationMin} min</Text>
          </View>
        </View>
      </Surface>
    </Pressable>
  );
}
