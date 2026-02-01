import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSettingsStore } from '../stores/settingsStore';
import { useTranslation, type SupportedLocale } from '../i18n';
import { PixelText } from './PixelText';
import { COLORS, SPACING, BORDERS } from './theme';

const LANGUAGE_OPTIONS: { value: SupportedLocale; label: string }[] = [
  { value: 'ko', label: '한국어' },
  { value: 'en', label: 'English' },
  { value: 'system', label: 'System' },
];

export function LanguageSwitcher() {
  const { t } = useTranslation();
  const language = useSettingsStore((s) => s.language);
  const setLanguage = useSettingsStore((s) => s.setLanguage);

  const handleSelect = async (value: SupportedLocale) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLanguage(value);
  };

  return (
    <View style={styles.container}>
      <PixelText variant="body" style={styles.label}>
        {t('settings.language')}
      </PixelText>
      <View style={styles.options}>
        {LANGUAGE_OPTIONS.map((option) => (
          <Pressable
            key={option.value}
            onPress={() => handleSelect(option.value)}
            style={[
              styles.option,
              language === option.value && styles.optionSelected,
            ]}
          >
            <PixelText
              variant="caption"
              numberOfLines={1}
              style={language === option.value ? styles.optionTextSelected : styles.optionText}
            >
              {option.value === 'system' ? t('settings.system') : option.label}
            </PixelText>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderWidth: BORDERS.medium,
    borderColor: COLORS.border,
  },
  label: {
    color: COLORS.text,
    marginBottom: SPACING.md,
    fontWeight: 'bold',
  },
  options: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  option: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    backgroundColor: COLORS.background,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  optionSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryLight,
  },
  optionText: {
    color: COLORS.textMuted,
  },
  optionTextSelected: {
    color: COLORS.text,
    fontWeight: 'bold',
  },
});
