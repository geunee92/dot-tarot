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
import { formatMonthDisplay, parseDateKey } from '../utils/date';

export function HistoryDetailScreen({ route, navigation }: HistoryDetailScreenProps) {
  const { dateKey } = route.params;
  
  const draw = useDrawStore((s) => s.draws[dateKey]);
  const loadDraw = useDrawStore((s) => s.loadDraw);
  const isDrawHydrated = useDrawStore((s) => s.isHydrated);

  const spreads = useSpreadStore((s) => s.getSpreadsForDate(dateKey));
  const loadSpreadsForDate = useSpreadStore((s) => s.loadSpreadsForDate);
  const isSpreadHydrated = useSpreadStore((s) => s.isHydrated);

  const isHydrated = isDrawHydrated && isSpreadHydrated;

  useEffect(() => {
    if (isHydrated) {
      loadDraw(dateKey);
      loadSpreadsForDate(dateKey);
    }
  }, [isHydrated, dateKey]);

  const handleViewDraw = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('DailyResult', { dateKey, isNewDraw: false });
  }, [navigation, dateKey]);

  const handleViewSpread = useCallback((spread: SpreadRecord) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('SpreadResult', {
      dateKey,
      spreadId: spread.id,
      topic: spread.topic,
      isNewSpread: false,
    });
  }, [navigation, dateKey]);

  const handleClose = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const parsedDate = parseDateKey(dateKey);
  const formattedDate = parsedDate
    ? parsedDate.toLocaleDateString('en-US', {
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
            Loading history...
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
              Daily Card
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
                  {draw.drawnCard.card.nameEn}
                </PixelText>
                <PixelText
                  variant="caption"
                  color={draw.drawnCard.orientation === 'upright' ? COLORS.upright : COLORS.reversed}
                  style={styles.orientation}
                >
                  {draw.drawnCard.orientation === 'upright' ? 'Upright' : 'Reversed'}
                </PixelText>
                
                {draw.memo && (
                  <View style={styles.memoPreview}>
                    <PixelText variant="caption" style={styles.memoLabel}>
                      Memo:
                    </PixelText>
                    <PixelText variant="caption" style={styles.memoText} numberOfLines={2}>
                      {draw.memo}
                    </PixelText>
                  </View>
                )}
                
                <PixelText variant="caption" style={styles.tapHint}>
                  Tap to view details
                </PixelText>
              </View>
            </Pressable>
          </View>
        )}

        {spreads.length > 0 && (
          <View style={styles.section}>
            <PixelText variant="heading" style={styles.sectionTitle}>
              3-Card Spreads ({spreads.length})
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
                      {spread.topic}
                    </PixelText>
                    <PixelText variant="caption" style={styles.spreadPattern}>
                      {spread.pattern}
                    </PixelText>
                  </View>
                  
                  <View style={styles.spreadCards}>
                    {spread.cards.map((sc, i) => (
                      <View key={i} style={styles.miniCard}>
                        <PixelText variant="caption" style={styles.miniCardNumber}>
                          {sc.drawnCard.card.id}
                        </PixelText>
                        <PixelText
                          variant="caption"
                          style={{
                            color:
                              sc.drawnCard.orientation === 'upright'
                                ? COLORS.upright
                                : COLORS.reversed,
                          }}
                        >
                          {sc.drawnCard.orientation === 'upright' ? '↑' : '↓'}
                        </PixelText>
                      </View>
                    ))}
                    
                    {spread.clarifier && (
                      <View style={[styles.miniCard, styles.clarifierMini]}>
                        <PixelText variant="caption" style={styles.miniCardNumber}>
                          +{spread.clarifier.drawnCard.card.id}
                        </PixelText>
                      </View>
                    )}
                  </View>
                  
                  <PixelText variant="caption" style={styles.tapHint}>
                    Tap to view details
                  </PixelText>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {!draw && spreads.length === 0 && (
          <View style={styles.emptyState}>
            <PixelText variant="body" style={styles.emptyText}>
              No readings found for this date.
            </PixelText>
          </View>
        )}

        <PixelButton
          title="Close"
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
  spreadPattern: {
    color: COLORS.textMuted,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  spreadCards: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  miniCard: {
    width: 50,
    height: 60,
    backgroundColor: COLORS.background,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clarifierMini: {
    borderColor: COLORS.accent,
  },
  miniCardNumber: {
    color: COLORS.text,
    fontWeight: 'bold',
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
  closeButton: {
    alignSelf: 'center',
    marginTop: SPACING.lg,
  },
});
