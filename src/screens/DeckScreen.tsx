import React, { useCallback } from 'react';
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
  COLORS,
  SPACING,
  FONTS,
  BORDERS,
} from '../components';
import { useRewardStore, getMilestoneProgress } from '../stores/rewardStore';
import { useDrawStore } from '../stores/drawStore';
import { DeckScreenProps } from '../navigation/types';
import { BackSkin } from '../types';
import { BACK_SKINS } from '../data';
import { getMonthKey, countAttendanceInMonth } from '../utils/date';

export function DeckScreen({ navigation }: DeckScreenProps) {
  const unlockedSkins = useRewardStore((s) => s.getUnlockedSkins());
  const lockedSkins = useRewardStore((s) => s.getLockedSkins());
  const selectedSkinId = useRewardStore((s) => s.selectedSkinId);
  const selectSkin = useRewardStore((s) => s.selectSkin);
  const getNextMilestone = useRewardStore((s) => s.getNextMilestone);
  
  const getDrawDates = useDrawStore((s) => s.getDrawDates);
  
  const drawDates = getDrawDates();
  const currentMonth = getMonthKey();
  const attendanceDays = countAttendanceInMonth(drawDates, currentMonth);
  const nextMilestone = getNextMilestone(attendanceDays);
  const progress = getMilestoneProgress(attendanceDays, nextMilestone);

  const handleSelectSkin = useCallback(async (skinId: string) => {
    if (skinId === selectedSkinId) return;
    
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await selectSkin(skinId);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [selectSkin, selectedSkinId]);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const renderSkinCard = (skin: BackSkin, isUnlocked: boolean) => {
    const isSelected = skin.id === selectedSkinId;
    
    return (
      <Pressable
        key={skin.id}
        onPress={() => isUnlocked && handleSelectSkin(skin.id)}
        disabled={!isUnlocked}
        style={({ pressed }) => [
          styles.skinCard,
          isSelected && styles.skinCardSelected,
          !isUnlocked && styles.skinCardLocked,
          pressed && isUnlocked && styles.skinCardPressed,
        ]}
      >
        <View style={[styles.skinPreview, isUnlocked ? { backgroundColor: getSkinColor(skin.id) } : styles.lockedPreview]}>
          <PixelText variant="body" style={styles.skinSymbol}>
            {isUnlocked ? '✦' : '🔒'}
          </PixelText>
        </View>
        
        <View style={styles.skinInfo}>
          <View style={styles.skinNameRow}>
            <PixelText variant="body" style={isUnlocked ? styles.skinName : styles.skinNameLocked}>
              {skin.name}
            </PixelText>
            {isSelected && (
              <View style={styles.selectedBadge}>
                <PixelText variant="caption" style={styles.selectedText}>
                  Active
                </PixelText>
              </View>
            )}
          </View>
          
          <PixelText variant="caption" style={styles.skinDesc}>
            {skin.description}
          </PixelText>
          
          {!isUnlocked && (
            <PixelText variant="caption" style={styles.unlockReq}>
              Unlock at {skin.requiredDays} days
            </PixelText>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.progressSection}>
          <PixelText variant="heading" style={styles.sectionTitle}>
            Attendance Progress
          </PixelText>
          
          <View style={styles.progressBox}>
            <View style={styles.progressHeader}>
              <PixelText variant="body" style={styles.progressLabel}>
                This Month
              </PixelText>
              <PixelText variant="body" style={styles.progressValue}>
                {attendanceDays} days
              </PixelText>
            </View>
            
            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, { width: `${progress.percentage}%` }]}
              />
            </View>
            
            {nextMilestone && (
              <PixelText variant="caption" style={styles.nextMilestone}>
                Next reward at {nextMilestone.days} days ({nextMilestone.days - attendanceDays} more)
              </PixelText>
            )}
            
            {!nextMilestone && (
              <PixelText variant="caption" style={styles.allUnlocked}>
                All rewards unlocked this month!
              </PixelText>
            )}
          </View>
        </View>

        <View style={styles.skinsSection}>
          <PixelText variant="heading" style={styles.sectionTitle}>
            Unlocked Skins
          </PixelText>
          
          <View style={styles.skinsList}>
            {unlockedSkins.map((skin) => renderSkinCard(skin, true))}
          </View>
        </View>

        {lockedSkins.length > 0 && (
          <View style={styles.skinsSection}>
            <PixelText variant="heading" style={styles.sectionTitle}>
              Locked Skins
            </PixelText>
            
            <View style={styles.skinsList}>
              {lockedSkins.map((skin) => renderSkinCard(skin, false))}
            </View>
          </View>
        )}

        <PixelButton
          title="Back to Home"
          onPress={handleGoBack}
          variant="ghost"
          size="medium"
          style={styles.backButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function getSkinColor(skinId: string): string {
  const colors: Record<string, string> = {
    skin_default: COLORS.primary,
    skin_1: '#1e3a5f',
    skin_2: '#5c4033',
    skin_3: '#4a1942',
    skin_special: '#0f0f2d',
  };
  return colors[skinId] || COLORS.primary;
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
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  progressSection: {
    paddingVertical: SPACING.lg,
  },
  sectionTitle: {
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  progressBox: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderWidth: BORDERS.medium,
    borderColor: COLORS.border,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  progressLabel: {
    color: COLORS.textMuted,
  },
  progressValue: {
    color: COLORS.accent,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 12,
    backgroundColor: COLORS.background,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
  },
  nextMilestone: {
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  allUnlocked: {
    color: COLORS.success,
    marginTop: SPACING.sm,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  skinsSection: {
    paddingVertical: SPACING.lg,
  },
  skinsList: {
    gap: SPACING.md,
  },
  skinCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderWidth: BORDERS.medium,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  skinCardSelected: {
    borderColor: COLORS.accent,
  },
  skinCardLocked: {
    opacity: 0.6,
  },
  skinCardPressed: {
    backgroundColor: COLORS.surfaceLight,
  },
  skinPreview: {
    width: 80,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockedPreview: {
    backgroundColor: COLORS.background,
  },
  skinSymbol: {
    fontSize: FONTS.title,
    color: COLORS.accent,
  },
  skinInfo: {
    flex: 1,
    padding: SPACING.md,
    justifyContent: 'center',
  },
  skinNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  skinName: {
    color: COLORS.text,
    fontWeight: 'bold',
    fontSize: FONTS.lg,
  },
  skinNameLocked: {
    color: COLORS.textDark,
    fontWeight: 'bold',
    fontSize: FONTS.lg,
  },
  selectedBadge: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
  },
  selectedText: {
    color: COLORS.background,
    fontWeight: 'bold',
  },
  skinDesc: {
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  unlockReq: {
    color: COLORS.warning,
    marginTop: SPACING.xs,
    fontWeight: 'bold',
  },
  backButton: {
    alignSelf: 'center',
    marginTop: SPACING.lg,
  },
});
