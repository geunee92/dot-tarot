import React, { useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import {
  PixelButton,
  PixelText,
  PixelCard,
  LoadingSpinner,
  COLORS,
  SPACING,
  FONTS,
  BORDERS,
} from '../components';
import { useDrawStore } from '../stores/drawStore';
import { useSpreadStore } from '../stores/spreadStore';
import { HistoryDetailScreenProps } from '../navigation/types';
import { SpreadRecord } from '../types';
import { parseDateKey } from '../utils/date';
import { useTranslation, getLocale } from '../i18n';
import { getCardName } from '../utils/cards';

export function HistoryDetailScreen({ route, navigation }: HistoryDetailScreenProps) {
  const { t } = useTranslation();
  const dateKey = route.params?.dateKey;
  
  const draw = useDrawStore((s) => dateKey ? s.draws[dateKey] : undefined);
  const loadDraw = useDrawStore((s) => s.loadDraw);
  const isDrawHydrated = useDrawStore((s) => s.isHydrated);

  const spreads = useSpreadStore((s) => s.getSpreadsForDate(dateKey ?? ''));
  const loadSpreadsForDate = useSpreadStore((s) => s.loadSpreadsForDate);
  const isSpreadHydrated = useSpreadStore((s) => s.isHydrated);

  const isHydrated = isDrawHydrated && isSpreadHydrated;

  useEffect(() => {
    if (isHydrated && dateKey) {
      loadDraw(dateKey);
      loadSpreadsForDate(dateKey);
    }
  }, [isHydrated, dateKey, loadDraw, loadSpreadsForDate]);

  const handleViewDraw = useCallback(() => {
    if (!dateKey) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('TrainingResult', { dateKey, isNewDraw: false });
  }, [navigation, dateKey]);

  const handleViewSpread = useCallback((spread: SpreadRecord) => {
    if (!dateKey) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('QuestResult', {
      dateKey,
      spreadId: spread.id,
      topic: spread.topic,
      isNewSpread: false,
    });
  }, [navigation, dateKey]);

  const handleClose = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  if (!dateKey) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <PixelText variant="body" style={styles.loadingText}>
            {t('common.error')}
          </PixelText>
          <PixelButton
            title={t('common.close')}
            onPress={handleClose}
            variant="secondary"
            size="medium"
            style={styles.closeButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  const parsedDate = parseDateKey(dateKey);
  const locale = getLocale();
  const formattedDate = parsedDate
    ? parsedDate.toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : dateKey;

  if (!isHydrated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner size={60} />
          <PixelText variant="body" style={styles.loadingText}>
            {t('common.loading')}
          </PixelText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <PixelText variant="heading" style={styles.dateTitle}>
            {formattedDate}
          </PixelText>
        </View>

        {draw && (
          <View style={styles.section}>
            <PixelText variant="heading" style={styles.sectionTitle}>
              {t('history.dailyCard')}
            </PixelText>
            
            <Pressable
              onPress={handleViewDraw}
              style={({ pressed }) => [
                styles.drawCard,
                pressed && styles.cardPressed,
              ]}
            >
              <PixelCard
                card={draw.drawnCard.card}
                orientation={draw.drawnCard.orientation}
                size="small"
              />
              
              <View style={styles.drawInfo}>
                <PixelText variant="body" style={styles.cardName}>
                  {getCardName(draw.drawnCard.card)}
                </PixelText>
                <PixelText
                  variant="caption"
                  color={draw.drawnCard.orientation === 'upright' ? COLORS.upright : COLORS.reversed}
                  style={styles.orientation}
                >
                  {draw.drawnCard.orientation === 'upright' ? t('card.upright') : t('card.reversed')}
                </PixelText>
                
                {draw?.reflection && (
                  <View style={styles.reflectionPreview}>
                    <PixelText variant="caption" style={styles.reflectionLabel}>
                      {t('reflection.title')}:
                    </PixelText>
                    <PixelText variant="caption" style={styles.reflectionBadge}>
                      {draw.reflection.accuracy === 'accurate' ? '😊' : draw.reflection.accuracy === 'neutral' ? '😐' : '🤔'}
                      {' '}{t(`reflection.${draw.reflection.accuracy}`)}
                    </PixelText>
                  </View>
                )}

                {draw.memo && (
                  <View style={styles.memoPreview}>
                    <PixelText variant="caption" style={styles.memoLabel}>
                      {t('history.memo')}:
                    </PixelText>
                    <PixelText variant="caption" style={styles.memoText} numberOfLines={2}>
                      {draw.memo}
                    </PixelText>
                  </View>
                )}
                
                <PixelText variant="caption" style={styles.tapHint}>
                  {t('common.tapToView')}
                </PixelText>
              </View>
            </Pressable>
          </View>
        )}

        {spreads.length > 0 && (
          <View style={styles.section}>
            <PixelText variant="heading" style={styles.sectionTitle}>
              {t('home.spreadTitle')} ({spreads.length})
            </PixelText>
            
            <View style={styles.spreadsList}>
              {spreads.map((spread) => (
                <Pressable
                  key={spread.id}
                  onPress={() => handleViewSpread(spread)}
                  style={({ pressed }) => [
                    styles.spreadCard,
                    pressed && styles.cardPressed,
                  ]}
                >
                  <View style={styles.spreadHeader}>
                    <PixelText variant="body" style={styles.spreadTopic}>
                      {t(`home.topics.${spread.topic.toLowerCase()}`)}
                    </PixelText>
                  </View>
                  
                  {spread.userQuestion && (
                    <PixelText variant="caption" style={styles.spreadQuestion} numberOfLines={2}>
                      "{spread.userQuestion}"
                    </PixelText>
                  )}
                  
                  <View style={styles.spreadCards}>
                    {spread.cards.map((sc, i) => (
                      <View key={i} style={styles.spreadCardItem}>
                        <PixelCard
                          card={sc.drawnCard.card}
                          orientation={sc.drawnCard.orientation}
                          size="small"
                        />
                      </View>
                    ))}
                  </View>
                  
                  {spread.reflection && (
                    <View style={styles.reflectionPreview}>
                      <PixelText variant="caption" style={styles.reflectionBadge}>
                        {spread.reflection.accuracy === 'accurate' ? '😊' : spread.reflection.accuracy === 'neutral' ? '😐' : '🤔'}
                        {' '}{t(`reflection.${spread.reflection.accuracy}`)}
                      </PixelText>
                    </View>
                  )}

                  <PixelText variant="caption" style={styles.tapHint}>
                    {t('common.tapToView')}
                  </PixelText>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {!draw && spreads.length === 0 && (
          <View style={styles.emptyState}>
            <PixelText variant="body" style={styles.emptyText}>
              {t('history.noReadings')}
            </PixelText>
          </View>
        )}

        <PixelButton
          title={t('common.close')}
          onPress={handleClose}
          variant="secondary"
          size="medium"
          style={styles.closeButton}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.lg,
    color: COLORS.textMuted,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  header: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  dateTitle: {
    color: COLORS.accent,
    textAlign: 'center',
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  drawCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderWidth: BORDERS.medium,
    borderColor: COLORS.border,
    padding: SPACING.md,
    gap: SPACING.md,
  },
  cardPressed: {
    backgroundColor: COLORS.surfaceLight,
  },
  drawInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  cardName: {
    color: COLORS.text,
    fontWeight: 'bold',
  },
  orientation: {
    fontWeight: 'bold',
    marginTop: SPACING.xs,
  },
  memoPreview: {
    marginTop: SPACING.sm,
    backgroundColor: COLORS.background,
    padding: SPACING.sm,
  },
  memoLabel: {
    color: COLORS.textMuted,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  memoText: {
    color: COLORS.text,
    fontStyle: 'italic',
  },
  tapHint: {
    color: COLORS.textDark,
    marginTop: SPACING.sm,
  },
  spreadsList: {
    gap: SPACING.md,
  },
  spreadCard: {
    backgroundColor: COLORS.surface,
    borderWidth: BORDERS.medium,
    borderColor: COLORS.border,
    padding: SPACING.md,
  },
  spreadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  spreadTopic: {
    color: COLORS.accent,
    fontWeight: 'bold',
    fontSize: FONTS.lg,
  },
  spreadQuestion: {
    color: COLORS.textMuted,
    fontStyle: 'italic',
    marginBottom: SPACING.sm,
  },
  spreadCards: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  spreadCardItem: {
    flex: 1,
    maxWidth: 90,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyText: {
    color: COLORS.textMuted,
  },
  reflectionPreview: {
    marginTop: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  reflectionLabel: {
    color: COLORS.accent,
    fontWeight: 'bold',
  },
  reflectionBadge: {
    color: COLORS.text,
  },
  closeButton: {
    alignSelf: 'center',
    marginTop: SPACING.lg,
  },
});
