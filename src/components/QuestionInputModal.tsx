import React, { useState, useCallback } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { PixelText } from './PixelText';
import { PixelButton } from './PixelButton';
import { COLORS, SPACING, FONTS, BORDERS } from './theme';
import { SpreadTopic } from '../types';
import { useTranslation } from '../i18n';

const MAX_LENGTH = 30;

const TOPIC_ICONS: Record<SpreadTopic, string> = {
  LOVE: '💕',
  MONEY: '💰',
  WORK: '💼',
};

const EXAMPLE_QUESTIONS: Record<SpreadTopic, { en: string; ko: string }> = {
  LOVE: {
    en: 'Should I confess to my crush?',
    ko: '짝사랑에게 고백해도 될까요?',
  },
  MONEY: {
    en: 'Is it okay to make a big purchase?',
    ko: '이번 달 큰 지출을 해도 괜찮을까요?',
  },
  WORK: {
    en: 'Is now the right time to change jobs?',
    ko: '지금이 이직 적기일까요?',
  },
};

interface QuestionInputModalProps {
  visible: boolean;
  topic: SpreadTopic;
  onSubmit: (question: string | undefined) => void;
  onClose: () => void;
}

export function QuestionInputModal({
  visible,
  topic,
  onSubmit,
  onClose,
}: QuestionInputModalProps) {
  const { t, locale } = useTranslation();
  const [question, setQuestion] = useState('');

  const handleSubmit = useCallback(() => {
    onSubmit(question.trim() || undefined);
    setQuestion('');
  }, [question, onSubmit]);

  const handleSkip = useCallback(() => {
    onSubmit(undefined);
    setQuestion('');
  }, [onSubmit]);

  const handleClose = useCallback(() => {
    setQuestion('');
    onClose();
  }, [onClose]);

  const topicIcon = TOPIC_ICONS[topic];
  const topicLabel = t(`questionModal.topicLabels.${topic.toLowerCase()}`);
  const exampleQuestion = EXAMPLE_QUESTIONS[topic][locale === 'ko' ? 'ko' : 'en'];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <Pressable style={styles.backdrop} onPress={handleClose} />

        <View style={styles.container}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <PixelText variant="heading" style={styles.title}>
              {topicIcon} {t('questionModal.title', { topic: topicLabel })}
            </PixelText>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={question}
              onChangeText={(text) => setQuestion(text.slice(0, MAX_LENGTH))}
              placeholder={t('questionModal.placeholder')}
              placeholderTextColor={COLORS.textMuted}
              maxLength={MAX_LENGTH}
              multiline={false}
              autoFocus
            />
            <PixelText variant="caption" style={styles.charCount}>
              {t('questionModal.charCount', { count: question.length })}
            </PixelText>
          </View>

          <PixelText variant="caption" style={styles.example}>
            {t('questionModal.example', { example: exampleQuestion })}
          </PixelText>

          <View style={styles.actions}>
            <PixelButton
              title={t('questionModal.startReading')}
              onPress={handleSubmit}
              variant="primary"
              size="large"
            />

            <Pressable onPress={handleSkip} style={styles.skipButton}>
              <PixelText variant="body" style={styles.skipText}>
                {t('questionModal.skip')}
              </PixelText>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  container: {
    backgroundColor: COLORS.background,
    borderTopWidth: BORDERS.thick,
    borderLeftWidth: BORDERS.thick,
    borderRightWidth: BORDERS.thick,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl + 16,
    paddingTop: SPACING.md,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    alignSelf: 'center',
    marginBottom: SPACING.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    color: COLORS.text,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: SPACING.md,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: BORDERS.medium,
    borderColor: COLORS.border,
    padding: SPACING.md,
    fontSize: FONTS.md,
    color: COLORS.text,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  charCount: {
    color: COLORS.textMuted,
    textAlign: 'right',
    marginTop: SPACING.xs,
  },
  example: {
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  actions: {
    gap: SPACING.md,
  },
  skipButton: {
    alignItems: 'center',
    padding: SPACING.md,
  },
  skipText: {
    color: COLORS.textMuted,
  },
});
