import { useCallback, useMemo, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { MessageCircle, Send, Sparkles, Trash2, X } from 'lucide-react-native';
import { Button, Input, Spinner, Surface, Text, useThemeColor } from 'heroui-native';
import { FlatList, KeyboardAvoidingView, Modal, Platform, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AGENT_GREETING, eventById, generateReply } from '@/lib/agent';
import { todayKey, useChatStore, useCheckInStore, useProfileStore } from '@/lib/store';
import { useLocation } from '@/lib/useLocation';
import { useWeather } from '@/lib/weather';
import type { ChatMessage } from '@/lib/types';

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function MessageBubble({
  message,
  onEventPress,
}: {
  message: ChatMessage;
  onEventPress: (id: string) => void;
}) {
  const isUser = message.role === 'user';
  return (
    <View className={isUser ? 'items-end' : 'items-start'}>
      <View
        className={
          isUser
            ? 'bg-accent max-w-[85%] rounded-2xl rounded-br-sm px-4 py-2.5'
            : 'bg-default max-w-[85%] rounded-2xl rounded-bl-sm px-4 py-2.5'
        }
      >
        <Text className={isUser ? 'text-accent-foreground text-sm' : 'text-foreground text-sm'}>
          {message.text}
        </Text>
      </View>
      {!isUser && message.eventIds && message.eventIds.length > 0 ? (
        <View className="mt-2 max-w-[85%] flex-row flex-wrap gap-2">
          {message.eventIds.map((id) => {
            const ev = eventById(id);
            if (!ev) return null;
            return (
              <Pressable
                key={id}
                onPress={() => onEventPress(id)}
                className="bg-soft-accent rounded-full px-3 py-1.5"
              >
                <Text className="text-foreground text-xs font-semibold" numberOfLines={1}>
                  {ev.title}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

export function CoachChat() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [thinking, setThinking] = useState(false);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const messages = useChatStore((s) => s.messages);
  const addMessage = useChatStore((s) => s.addMessage);
  const clear = useChatStore((s) => s.clear);

  const profile = useProfileStore((s) => s.profile);
  const checkIns = useCheckInStore((s) => s.checkIns);
  const { coords } = useLocation();
  const { forecast } = useWeather(coords);

  const [accent, foreground, danger] = useThemeColor(['accent', 'foreground', 'danger']);

  const today = todayKey();
  const todaysCheckIn = useMemo(
    () => checkIns.find((c) => c.date === today) ?? null,
    [checkIns, today],
  );

  const scrollToEnd = useCallback(() => {
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  }, []);

  const send = useCallback(() => {
    const text = draft.trim();
    if (!text || thinking) return;
    setDraft('');
    const userMsg: ChatMessage = { id: makeId(), role: 'user', text, createdAt: Date.now() };
    addMessage(userMsg);
    setThinking(true);
    scrollToEnd();

    // Compute reply on-device; small delay reads as a natural response.
    setTimeout(() => {
      const reply = generateReply(text, {
        profile,
        checkIn: todaysCheckIn,
        coords,
        forecast,
      });
      addMessage({
        id: makeId(),
        role: 'agent',
        text: reply.text,
        createdAt: Date.now(),
        eventIds: reply.eventIds,
      });
      setThinking(false);
      scrollToEnd();
    }, 350);
  }, [draft, thinking, addMessage, scrollToEnd, profile, todaysCheckIn, coords, forecast]);

  const openEvent = useCallback(
    (id: string) => {
      setOpen(false);
      router.push({ pathname: '/event/[id]', params: { id } });
    },
    [router],
  );

  const data = useMemo<ChatMessage[]>(() => {
    if (messages.length > 0) return messages;
    return [{ id: 'greeting', role: 'agent', text: AGENT_GREETING, createdAt: 0 }];
  }, [messages]);

  return (
    <>
      <Pressable
        accessibilityLabel="Talk to me"
        onPress={() => setOpen(true)}
        style={{ position: 'absolute', right: 12, top: insets.top + 6 }}
        className="bg-accent flex-row items-center gap-1.5 rounded-full px-3 py-1.5 shadow-sm active:opacity-90"
      >
        <MessageCircle size={16} color="#ffffff" />
        <Text className="text-accent-foreground text-xs font-semibold">Talk to me</Text>
      </Pressable>

      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <View className="flex-1 justify-end bg-black/40">
          <Pressable className="flex-1" onPress={() => setOpen(false)} />
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={0}
          >
            <Surface
              variant="default"
              className="overflow-hidden rounded-t-3xl"
              style={{ height: '82%', paddingBottom: insets.bottom }}
            >
              {/* Header */}
              <View className="border-border flex-row items-center gap-2 border-b px-4 py-3">
                <View className="bg-soft-accent h-9 w-9 items-center justify-center rounded-full">
                  <Sparkles size={18} color={accent} />
                </View>
                <View className="flex-1">
                  <Text className="text-foreground font-bold">Talk to me</Text>
                  <Text className="text-muted text-xs">On-device · private</Text>
                </View>
                {messages.length > 0 ? (
                  <Button size="sm" variant="ghost" onPress={clear}>
                    <Trash2 size={16} color={danger} />
                  </Button>
                ) : null}
                <Button size="sm" variant="ghost" onPress={() => setOpen(false)}>
                  <X size={18} color={foreground} />
                </Button>
              </View>

              {/* Messages */}
              <FlatList
                ref={listRef}
                data={data}
                keyExtractor={(m) => m.id}
                renderItem={({ item }) => <MessageBubble message={item} onEventPress={openEvent} />}
                contentContainerClassName="gap-3 p-4"
                onContentSizeChange={scrollToEnd}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                ListFooterComponent={
                  thinking ? (
                    <View className="flex-row items-center gap-2 py-1">
                      <Spinner size="sm" />
                      <Text className="text-muted text-xs">Thinking…</Text>
                    </View>
                  ) : null
                }
              />

              {/* Composer */}
              <View className="border-border flex-row items-end gap-2 border-t px-4 pt-3">
                <View className="flex-1">
                  <Input
                    value={draft}
                    onChangeText={setDraft}
                    placeholder="Ask for events or a wellness tip…"
                    multiline
                    onSubmitEditing={send}
                    returnKeyType="send"
                  />
                </View>
                <Button
                  isIconOnly
                  onPress={send}
                  isDisabled={draft.trim().length === 0 || thinking}
                >
                  <Send size={18} color="#ffffff" />
                </Button>
              </View>
            </Surface>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </>
  );
}
