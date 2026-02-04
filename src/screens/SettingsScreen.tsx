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
import { clearAll, setItem } from '../utils/storage';
import { useDrawStore } from '../stores/drawStore';
import { useRewardStore } from '../stores/rewardStore';
import { drawRandomCard } from '../utils/cards';
import { getDrawKey } from '../utils/storage';

const { DevSettings } = NativeModules;

const APP_VERSION = '1.0.0';

export function SettingsScreen({ navigation }: SettingsScreenProps) {
  const { t } = useTranslation();
  const [isResetting, setIsResetting] = useState(false);
  const [isInjecting, setIsInjecting] = useState(false);

  const handleInject56Days = useCallback(async () => {
    if (isInjecting) return;
    setIsInjecting(true);

    try {
      const now = Date.now();
      const fakeDraws: Record<string, any> = {};

      for (let i = 0; i < 56; i++) {
        const date = new Date(now - i * 24 * 60 * 60 * 1000);
        const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        const draw = {
          dateKey,
          drawnCard: drawRandomCard(),
          createdAt: date.getTime(),
        };
        fakeDraws[dateKey] = draw;
        await setItem(getDrawKey(dateKey), draw);
      }

      useDrawStore.setState((state) => ({
        draws: { ...state.draws, ...fakeDraws },
      }));

      const allDates = Object.keys(useDrawStore.getState().draws);
      await useRewardStore.getState().checkAndUnlockRewards(allDates);

      Alert.alert('Dev', `Injected 56 days. Total draws: ${allDates.length}. Check card backs!`);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setIsInjecting(false);
    }
  }, [isInjecting]);

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

        {__DEV__ && (
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
        )}

        {__DEV__ && (
          <View style={styles.devZone}>
            <PixelText variant="caption" style={styles.devLabel}>
              DEV TOOLS
            </PixelText>
            <PixelButton
              title={isInjecting ? 'Injecting...' : 'Inject 56 Days Attendance'}
              onPress={handleInject56Days}
              variant="primary"
              size="medium"
              loading={isInjecting}
              disabled={isInjecting}
            />
          </View>
        )}

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
  devZone: {
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderWidth: BORDERS.medium,
    borderColor: COLORS.accent,
    gap: SPACING.md,
  },
  devLabel: {
    color: COLORS.accent,
    fontWeight: 'bold',
  },
});
