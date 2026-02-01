import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Alert, NativeModules } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Updates from 'expo-updates';
import { useTranslation } from '../i18n';
import { SettingsScreenProps } from '../navigation/types';
import {
  PixelText,
  PixelButton,
  LanguageSwitcher,
  GradientBackground,
  COLORS,
  SPACING,
  BORDERS,
} from '../components';
import { clearAll } from '../utils/storage';

const { DevSettings } = NativeModules;

const APP_VERSION = '1.0.0';

export function SettingsScreen({ navigation }: SettingsScreenProps) {
  const { t } = useTranslation();
  const [isResetting, setIsResetting] = useState(false);

  const handleResetData = useCallback(() => {
    Alert.alert(
      t('settings.resetData'),
      t('settings.resetDataConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('settings.reset'),
          style: 'destructive',
          onPress: async () => {
            setIsResetting(true);
            try {
              await clearAll();
              if (__DEV__ && DevSettings?.reload) {
                DevSettings.reload();
              } else {
                await Updates.reloadAsync();
              }
            } catch {
              Alert.alert(
                t('settings.resetData'),
                t('settings.resetComplete'),
                [{ text: t('common.close') }]
              );
              setIsResetting(false);
            }
          },
        },
      ]
    );
  }, [t]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <GradientBackground variant="cosmic" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <PixelText variant="title" style={styles.title}>
          {t('settings.title')}
        </PixelText>

        <LanguageSwitcher />

        <View style={styles.versionContainer}>
          <PixelText variant="caption" style={styles.versionLabel}>
            {t('settings.version')}
          </PixelText>
          <PixelText variant="body" style={styles.versionText}>
            {APP_VERSION}
          </PixelText>
        </View>

        <View style={styles.dangerZone}>
          <PixelText variant="caption" style={styles.dangerLabel}>
            {t('settings.dangerZone')}
          </PixelText>
          <PixelButton
            title={isResetting ? t('settings.resetting') : t('settings.resetData')}
            onPress={handleResetData}
            variant="secondary"
            size="medium"
            loading={isResetting}
            disabled={isResetting}
          />
        </View>

        <PixelButton
          title={t('common.backHome')}
          onPress={() => navigation.goBack()}
          variant="ghost"
          size="medium"
          style={styles.backButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    gap: SPACING.xl,
  },
  title: {
    color: COLORS.accent,
    marginBottom: SPACING.md,
  },
  versionContainer: {
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderWidth: BORDERS.medium,
    borderColor: COLORS.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  versionLabel: {
    color: COLORS.textMuted,
  },
  versionText: {
    color: COLORS.text,
  },
  backButton: {
    alignSelf: 'center',
    marginTop: SPACING.lg,
  },
  dangerZone: {
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderWidth: BORDERS.medium,
    borderColor: COLORS.error,
    gap: SPACING.md,
  },
  dangerLabel: {
    color: COLORS.error,
  },
});
