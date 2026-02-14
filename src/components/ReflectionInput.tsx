import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useTranslation } from '../i18n';
import * as Haptics from 'expo-haptics';
import { Reflection, ReflectionAccuracy } from '../types';
import { PixelText } from './PixelText';
import { PixelButton } from './PixelButton';
import { COLORS, SPACING, BORDERS, FONT_FAMILY, SHADOWS, FONTS } from './theme';

interface ReflectionInputProps {
  keywords?: string[];
  question: string;
  existingReflection?: Reflection;
  onSave: (accuracy: ReflectionAccuracy, text?: string) => void;
  isLoading?: boolean;
  onInputFocus?: () => void;
}

export function ReflectionInput({
  keywords,
  question,
  existingReflection,
  onSave,
  isLoading = false,
  onInputFocus,
}: ReflectionInputProps) {
  const { t, locale } = useTranslation();
  const [selectedAccuracy, setSelectedAccuracy] = useState<ReflectionAccuracy | null>(null);
  const [text, setText] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (existingReflection) {
      setSelectedAccuracy(existingReflection.accuracy);
      setText(existingReflection.text || '');
    }
  }, [existingReflection]);

  const handleAccuracyPress = (accuracy: ReflectionAccuracy) => {
    Haptics.selectionAsync();
    setSelectedAccuracy(accuracy);
  };

  const handleSave = () => {
    if (!selectedAccuracy) return;
    
    onSave(selectedAccuracy, text);
    setSaved(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    setTimeout(() => {
      setSaved(false);
    }, 1500);
  };

  const isKorean = locale === 'ko';
  const inputFontFamily = isKorean ? FONT_FAMILY.korean : FONT_FAMILY.pixel;

  const accuracyOptions: { value: ReflectionAccuracy; label: string; emoji: string }[] = [
    { 
      value: 'accurate', 
      label: t('reflection.accurate'), 
      emoji: t('reflection.accurateEmoji') 
    },
    { 
      value: 'neutral', 
      label: t('reflection.neutral'), 
      emoji: t('reflection.neutralEmoji') 
    },
    { 
      value: 'unsure', 
      label: t('reflection.unsure'), 
      emoji: t('reflection.unsureEmoji') 
    },
  ];

  return (
    <View style={styles.container}>
      <PixelText variant="body" color={COLORS.accent} align="center" style={styles.question}>
        {question}
      </PixelText>

      {keywords && keywords.length > 0 && (
        <View style={styles.keywordsContainer}>
          <PixelText variant="caption" style={styles.keywordsLabel}>
            {t('reflection.keywords')}
          </PixelText>
          <View style={styles.keywordsRow}>
            {keywords.map((keyword, index) => (
              <View key={index} style={styles.keywordBadge}>
                <PixelText variant="caption" style={styles.keywordText}>
                  {keyword}
                </PixelText>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.accuracyContainer}>
        {accuracyOptions.map((option) => {
          const isSelected = selectedAccuracy === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => handleAccuracyPress(option.value)}
              style={[
                styles.accuracyButton,
                isSelected && styles.accuracyButtonSelected,
              ]}
            >
              <View style={styles.emojiWrap}>
                <Text style={styles.emoji}>{option.emoji}</Text>
              </View>
              <PixelText 
                variant="caption" 
                color={isSelected ? COLORS.accent : COLORS.textMuted}
                align="center"
                style={styles.accuracyLabel}
              >
                {option.label}
              </PixelText>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            { fontFamily: inputFontFamily },
          ]}
          placeholder={t('reflection.textPlaceholder')}
          placeholderTextColor={COLORS.textMuted}
          multiline
          numberOfLines={3}
          maxLength={300}
          value={text}
          onChangeText={setText}
          textAlignVertical="top"
          onFocus={onInputFocus}
        />
        <PixelText variant="caption" color={COLORS.textMuted} align="right" style={styles.charCount}>
          {t('reflection.charCount', { count: text.length })}
        </PixelText>
      </View>

      <PixelButton
        title={saved ? t('reflection.saved') : t('reflection.save')}
        onPress={handleSave}
        variant="accent"
        disabled={!selectedAccuracy || isLoading || saved}
        loading={isLoading}
        fullWidth
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: SPACING.lg,
  },
  question: {
    marginBottom: SPACING.xs,
  },
  keywordsContainer: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  keywordsLabel: {
    opacity: 0.8,
  },
  keywordsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  keywordBadge: {
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    backgroundColor: COLORS.surface,
  },
  keywordText: {
    fontSize: FONTS.xs,
  },
  accuracyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
    overflow: 'visible',
  },
  accuracyButton: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: BORDERS.medium,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.xs,
    overflow: 'visible',
    ...SHADOWS.blockLight,
  },
  accuracyButtonSelected: {
    borderColor: COLORS.accent,
    ...SHADOWS.glow,
  },
  emojiWrap: {
    height: 44,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: SPACING.xs,
  },
  emoji: {
    fontSize: 32,
    lineHeight: 44,
    textAlign: 'center' as const,
  },
  accuracyLabel: {
    fontSize: 10,
    lineHeight: 12,
  },
  inputContainer: {
    gap: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: BORDERS.medium,
    borderColor: COLORS.border,
    color: COLORS.text,
    padding: SPACING.md,
    minHeight: 80,
    fontSize: FONTS.sm,
  },
  charCount: {
    opacity: 0.7,
  },
});
