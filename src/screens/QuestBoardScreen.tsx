import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import {
  PixelText,
  GradientBackground,
  LoadingSpinner,
  QuestionInputModal,
  RewardedAdButton,
  Toast,
  AdBadge,
  COLORS,
  SPACING,
  FONTS,
  BORDERS,
} from '../components';
import { useSpreadStore } from '../stores/spreadStore';
import { useGatingStore } from '../stores/gatingStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useCharacterStore } from '../stores/characterStore';
import { TOPIC_CONFIGS } from '../config/topics';
import { getLocalDateKey, parseDateKey } from '../utils/date';
import { MainTabParamList, RootStackParamList } from '../navigation/types';
import { SpreadTopic, SpreadRecord } from '../types';
import { useTranslation } from '../i18n';

type QuestBoardScreenProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'QuestsTab'>,
  NativeStackScreenProps<RootStackParamList>
>;

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - SPACING.lg * 3) / 2;

export function QuestBoardScreen({ navigation }: QuestBoardScreenProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const isSpreadHydrated = useSpreadStore((s) => s.isHydrated);
  const spreads = useSpreadStore((s) => s.spreads);
  const createSpread = useSpreadStore((s) => s.createSpread);

  const isGatingHydrated = useGatingStore((s) => s.isHydrated);
  const loadGatingForDate = useGatingStore((s) => s.loadGatingForDate);
  const canDoFreeSpread = useGatingStore((s) => s.canDoFreeSpread);
  const useFreeSpread = useGatingStore((s) => s.useFreeSpread);
  const useAnotherTopic = useGatingStore((s) => s.useAnotherTopic);

  const isSettingsHydrated = useSettingsStore((s) => s.isHydrated);
  
  const isCharacterHydrated = useCharacterStore((s) => s.isHydrated);
  const level = useCharacterStore((s) => s.level);
  const canAccessTopic = useCharacterStore((s) => s.canAccessTopic);

  const [selectedTopic, setSelectedTopic] = useState<SpreadTopic | null>(null);
  const [isQuestionModalVisible, setIsQuestionModalVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showAdModal, setShowAdModal] = useState(false);

  const isReady = isSpreadHydrated && isGatingHydrated && isSettingsHydrated && isCharacterHydrated;
  const todayKey = getLocalDateKey();

  useEffect(() => {
    if (isGatingHydrated) {
      loadGatingForDate(todayKey);
    }
  }, [isGatingHydrated, loadGatingForDate, todayKey]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2000);
  };

  const handleTopicPress = (topicId: SpreadTopic) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (!canAccessTopic(topicId)) {
      const config = TOPIC_CONFIGS.find((c) => c.id === topicId);
      if (config) {
        showToast('Lv.' + config.requiredLevel + ' 이상 필요합니다');
      }
      return;
    }

    if (!canDoFreeSpread(todayKey)) {
      setSelectedTopic(topicId);
      setShowAdModal(true);
      return;
    }

    initiateSpreadCreation(topicId);
  };

  const initiateSpreadCreation = (topicId: SpreadTopic) => {
    const config = TOPIC_CONFIGS.find((c) => c.id === topicId);
    if (!config) return;

    if (config.hasQuestionInput) {
      setSelectedTopic(topicId);
      setIsQuestionModalVisible(true);
    } else {
      handleCreateSpread(topicId, undefined);
    }
  };

  const handleAdRewardEarned = () => {
    setShowAdModal(false);
    if (selectedTopic) {
      initiateSpreadCreation(selectedTopic);
    }
  };

  const handleCreateSpread = async (topicId: SpreadTopic, question?: string) => {
    try {
      const spread = await createSpread(topicId, question, todayKey);

      if (canDoFreeSpread(todayKey)) {
        useFreeSpread(todayKey);
      } else {
        useAnotherTopic(todayKey);
      }

      navigation.navigate('QuestResult', {
        dateKey: todayKey,
        spreadId: spread.id,
        topic: topicId,
        isNewSpread: true,
      });

      setIsQuestionModalVisible(false);
      setSelectedTopic(null);
    } catch (error) {
      console.error('Failed to create spread:', error);
      showToast('퀘스트 생성 실패');
    }
  };

  const handleQuestionSubmit = (question: string | undefined) => {
    if (selectedTopic) {
      handleCreateSpread(selectedTopic, question);
    }
  };

  const handleRecentPress = (spreadId: string, dateKey: string, topic: SpreadTopic) => {
    navigation.navigate('QuestResult', {
      dateKey,
      spreadId,
      topic,
      isNewSpread: false,
    });
  };

  const renderTopicCard = (config: typeof TOPIC_CONFIGS[0]) => {
    const isLocked = !canAccessTopic(config.id);
    const label = t('home.topics.' + config.id.toLowerCase());
    const isFreeAvailable = canDoFreeSpread(todayKey);

    return (
      <TouchableOpacity
        key={config.id}
        style={[
          styles.card,
          isLocked && styles.cardLocked,
        ]}
        onPress={() => handleTopicPress(config.id)}
        activeOpacity={0.7}
      >
        <View style={styles.cardContent}>
          {!isFreeAvailable && !isLocked && (
            <View style={styles.adBadgeContainer}>
              <AdBadge />
            </View>
          )}
          <PixelText variant="body" style={styles.cardEmoji}>{config.emoji}</PixelText>
          <PixelText variant="body" style={styles.cardLabel}>{label}</PixelText>
          
          {isLocked && (
            <View style={styles.lockOverlay}>
              <PixelText variant="body" style={styles.lockIcon}>🔒</PixelText>
              <PixelText variant="caption" style={styles.lockText}>Lv.{config.requiredLevel}</PixelText>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderRecentQuest = (spread: SpreadRecord) => {
    const config = TOPIC_CONFIGS.find((c) => c.id === spread.topic);
    const date = parseDateKey(spread.dateKey);
    const dateStr = date ? (date.getMonth() + 1) + '/' + date.getDate() : '';
    const label = t('home.topics.' + spread.topic.toLowerCase());

    return (
      <TouchableOpacity
        key={spread.id}
        style={styles.recentItem}
        onPress={() => handleRecentPress(spread.id, spread.dateKey, spread.topic)}
      >
        <View style={styles.recentIconContainer}>
          <PixelText variant="body" style={styles.recentEmoji}>{config?.emoji || '❓'}</PixelText>
        </View>
        <View style={styles.recentInfo}>
          <View style={styles.recentHeader}>
            <PixelText variant="caption" style={styles.recentTopic}>{label}</PixelText>
            <PixelText variant="caption" style={styles.recentDate}>{dateStr}</PixelText>
          </View>
          <PixelText variant="body" style={styles.recentQuestion} numberOfLines={1}>
            {spread.userQuestion || t('home.generalReading')}
          </PixelText>
        </View>
      </TouchableOpacity>
    );
  };

  if (!isReady) {
    return (
      <GradientBackground variant="plum">
        <View style={styles.loadingContainer}>
          <LoadingSpinner />
        </View>
      </GradientBackground>
    );
  }

  const recentSpreads = Object.values(spreads)
    .flat()
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 5);

  return (
    <GradientBackground variant="plum">
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <PixelText variant="heading" style={styles.headerTitle}>{t('home.spreadTitle')}</PixelText>
            <View style={styles.levelBadge}>
              <PixelText variant="caption" style={styles.levelText}>Lv.{level}</PixelText>
            </View>
          </View>

          <View style={styles.gridContainer}>
            {TOPIC_CONFIGS.map(renderTopicCard)}
          </View>

          {recentSpreads.length > 0 && (
            <View style={styles.recentSection}>
              <PixelText variant="heading" style={styles.sectionTitle}>최근 퀘스트</PixelText>
              {recentSpreads.map(renderRecentQuest)}
            </View>
          )}
        </ScrollView>

        <Toast 
          message={toastMessage || ''} 
          visible={!!toastMessage} 
          onDismiss={() => setToastMessage(null)}
        />

        <QuestionInputModal
          visible={isQuestionModalVisible}
          topic={selectedTopic || 'GENERAL'}
          onSubmit={handleQuestionSubmit}
          onClose={() => {
            setIsQuestionModalVisible(false);
            setSelectedTopic(null);
          }}
        />

        <Modal
          visible={showAdModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowAdModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <PixelText variant="heading" style={styles.modalTitle}>추가 퀘스트 잠금 해제</PixelText>
              <PixelText variant="body" style={styles.modalText}>
                오늘의 무료 퀘스트를 이미 완료했습니다.{"\n"}
                광고를 시청하고 새로운 퀘스트를 시작하시겠습니까?
              </PixelText>
              
              <RewardedAdButton
                title="광고 보고 잠금 해제"
                subtitle="새로운 운세 확인하기"
                onRewardEarned={handleAdRewardEarned}
              />
              
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowAdModal(false)}
              >
                <PixelText variant="body" style={styles.closeButtonText}>{t('common.cancel')}</PixelText>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl * 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  headerTitle: {
    fontSize: FONTS.xl,
    color: COLORS.text,
  },
  levelBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.border,
  },
  levelText: {
    color: COLORS.text,
    fontSize: FONTS.md,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.2,
    backgroundColor: COLORS.surface,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: BORDERS.thin * 4,
    borderRightWidth: BORDERS.thin * 4,
  },
  cardLocked: {
    backgroundColor: COLORS.surface,
  },
  cardContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  adBadgeContainer: {
    position: 'absolute',
    top: SPACING.xs,
    right: SPACING.xs,
    zIndex: 5,
  },
  cardEmoji: {
    fontSize: 40,
    marginBottom: SPACING.sm,
  },
  cardLabel: {
    fontSize: FONTS.md,
    color: COLORS.text,
    textAlign: 'center',
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  lockIcon: {
    fontSize: 32,
    marginBottom: SPACING.xs,
  },
  lockText: {
    color: COLORS.text,
    fontSize: FONTS.sm,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: FONTS.lg,
    color: COLORS.text,
    marginBottom: SPACING.md,
    marginTop: SPACING.md,
  },
  recentSection: {
    marginTop: SPACING.md,
  },
  recentItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    alignItems: 'center',
    borderBottomWidth: BORDERS.thin * 2,
    borderRightWidth: BORDERS.thin * 2,
  },
  recentIconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.border,
    marginRight: SPACING.md,
  },
  recentEmoji: {
    fontSize: 20,
  },
  recentInfo: {
    flex: 1,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  recentTopic: {
    color: COLORS.primary,
    fontSize: FONTS.sm,
  },
  recentDate: {
    color: COLORS.textMuted,
    fontSize: FONTS.xs,
  },
  recentQuestion: {
    color: COLORS.text,
    fontSize: FONTS.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlayDark,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    width: '100%',
    backgroundColor: COLORS.background,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    alignItems: 'center',
    borderBottomWidth: BORDERS.thin * 4,
    borderRightWidth: BORDERS.thin * 4,
  },
  modalTitle: {
    fontSize: FONTS.lg,
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  modalText: {
    fontSize: FONTS.md,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 24,
  },
  closeButton: {
    marginTop: SPACING.md,
    padding: SPACING.md,
  },
  closeButtonText: {
    color: COLORS.textMuted,
    fontSize: FONTS.md,
    textDecorationLine: 'underline',
  },
});
