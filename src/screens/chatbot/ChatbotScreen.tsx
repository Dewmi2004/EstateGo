// src/screens/chatbot/ChatbotScreen.tsx
// EstateBot chat UI. Answers are generated locally by estateBotService.ts —
// see that file for how to swap in a real OpenAI/Gemini call later.

import React, { useRef, useState, useMemo } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Icon, ActivityIndicator } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { addUserMessage, sendMessage } from '@/redux/chatbot/chatbotSlice';
import Input from '@/components/Input/Input';
import { useThemeColors } from '@/theme/useThemeColors';
import { AppColors } from '@/theme/colors';
import { fonts, type } from '@/theme/typography';
import { moderateScale } from '@/utils/responsive';
import { ChatMessage } from '@/types/chat.types';

const SUGGESTIONS = [
  'Recommend a 2-bedroom flat',
  'My budget is LKR 20,000/mo',
  'What is a mortgage?',
  'Tips for a first-time buyer',
];

export default function ChatbotScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const dispatch = useAppDispatch();
  const { messages, isThinking } = useAppSelector((state) => state.chatbot);
  const { items: properties } = useAppSelector((state) => state.property);
  const [draft, setDraft] = useState('');
  const listRef = useRef<FlatList>(null);

  const handleSend = (textOverride?: string) => {
    const text = (textOverride ?? draft).trim();
    if (!text) return;
    dispatch(addUserMessage(text));
    dispatch(sendMessage({ text, properties }));
    setDraft('');
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isBot = item.role === 'bot';
    return (
      <View style={[styles.messageRow, isBot ? styles.botRow : styles.userRow]}>
        {isBot && (
          <View style={styles.botAvatar}>
            <Icon source="robot-outline" size={16} color={colors.textInverse} />
          </View>
        )}
        <View style={[styles.bubble, isBot ? styles.botBubble : styles.userBubble]}>
          <Text style={[styles.bubbleText, isBot ? styles.botText : styles.userText]}>{item.text}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Icon source="robot-happy-outline" size={20} color={colors.textInverse} />
        </View>
        <View>
          <Text style={styles.headerTitle}>EstateBot</Text>
          <Text style={styles.headerSubtitle}>AI property assistant</Text>
        </View>
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        />

        {isThinking && (
          <View style={styles.thinkingRow}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.thinkingText}>EstateBot is typing...</Text>
          </View>
        )}

        {messages.length <= 1 && (
          <View style={styles.suggestionsRow}>
            {SUGGESTIONS.map((s) => (
              <TouchableOpacity key={s} style={styles.suggestionChip} onPress={() => handleSend(s)}>
                <Text style={styles.suggestionText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.inputRow}>
          <View style={styles.inputWrapper}>
            <Input label="Ask EstateBot..." value={draft} onChangeText={setDraft} />
          </View>
          <TouchableOpacity style={styles.sendButton} onPress={() => handleSend()} disabled={!draft.trim()}>
            <Icon source="send" size={18} color={colors.textInverse} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (colors: AppColors) =>
  StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: moderateScale(20),
    paddingVertical: moderateScale(14),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: fonts.displaySemiBold,
    fontSize: moderateScale(type.h3),
    color: colors.text,
  },
  headerSubtitle: {
    fontFamily: fonts.body,
    fontSize: moderateScale(type.micro),
    color: colors.textMuted,
  },
  listContent: {
    padding: moderateScale(16),
    gap: 10,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  botRow: {
    justifyContent: 'flex-start',
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  botAvatar: {
    width: 26,
    height: 26,
    borderRadius: 9,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  botBubble: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
    marginLeft: 'auto',
  },
  bubbleText: {
    fontFamily: fonts.body,
    fontSize: moderateScale(type.body),
    lineHeight: moderateScale(20),
  },
  botText: {
    color: colors.text,
  },
  userText: {
    color: colors.textInverse,
  },
  thinkingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: moderateScale(20),
    paddingBottom: 6,
  },
  thinkingText: {
    fontFamily: fonts.body,
    fontSize: moderateScale(type.micro),
    color: colors.textMuted,
  },
  suggestionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: moderateScale(16),
    paddingBottom: 10,
  },
  suggestionChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.surface,
  },
  suggestionText: {
    fontFamily: fonts.bodyMedium,
    fontSize: moderateScale(type.micro),
    color: colors.primary,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: moderateScale(16),
    paddingBottom: moderateScale(14),
    paddingTop: 4,
  },
  inputWrapper: {
    flex: 1,
  },
  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 22,
  },
});
