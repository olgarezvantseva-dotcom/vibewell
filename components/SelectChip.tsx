import { Pressable, View } from 'react-native';
import { Text } from 'heroui-native';

import { cn } from '@/lib/utils';

interface SelectChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

/** A pill toggle used for multi-select interests and single-select options. */
export function SelectChip({ label, selected, onPress }: SelectChipProps) {
  return (
    <Pressable onPress={onPress}>
      <View
        className={cn(
          'rounded-full border px-4 py-2',
          selected ? 'bg-accent border-accent' : 'bg-surface border-border',
        )}
      >
        <Text
          className={cn(
            'text-sm font-medium',
            selected ? 'text-accent-foreground' : 'text-foreground',
          )}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}
