import { SpreadTopic } from '../types/spread';
import { UNLOCK_TABLE } from './progression';

export interface TopicConfig {
  id: SpreadTopic;
  emoji: string;
  requiredLevel: number;
  hasQuestionInput: boolean;
  questLabelKo: string;
  questLabelEn: string;
  questDescKo: string;
  questDescEn: string;
}

export const TOPIC_CONFIGS: TopicConfig[] = [
  {
    id: 'GENERAL',
    emoji: '🔮',
    requiredLevel: UNLOCK_TABLE.GENERAL,
    hasQuestionInput: false,
    questLabelKo: '범용 스프레드',
    questLabelEn: 'General Spread',
    questDescKo: '막연한 고민에 대한 타로 스프레드',
    questDescEn: 'A tarot spread for general concerns',
  },
  {
    id: 'LOVE',
    emoji: '💕',
    requiredLevel: UNLOCK_TABLE.LOVE,
    hasQuestionInput: true,
    questLabelKo: '연애 스프레드',
    questLabelEn: 'Love Spread',
    questDescKo: '연애에 대한 타로 스프레드',
    questDescEn: 'A tarot spread about love and relationships',
  },
  {
    id: 'MONEY',
    emoji: '💰',
    requiredLevel: UNLOCK_TABLE.MONEY,
    hasQuestionInput: true,
    questLabelKo: '금전 스프레드',
    questLabelEn: 'Finance Spread',
    questDescKo: '금전에 대한 타로 스프레드',
    questDescEn: 'A tarot spread about finances and wealth',
  },
  {
    id: 'WORK',
    emoji: '💼',
    requiredLevel: UNLOCK_TABLE.WORK,
    hasQuestionInput: true,
    questLabelKo: '직장 스프레드',
    questLabelEn: 'Career Spread',
    questDescKo: '직장에 대한 타로 스프레드',
    questDescEn: 'A tarot spread about career and work',
  },
];

/** Get topic config by ID */
export function getTopicConfig(topic: SpreadTopic): TopicConfig | undefined {
  return TOPIC_CONFIGS.find(t => t.id === topic);
}

/** Get all unlocked topics for a given level */
export function getUnlockedTopics(level: number): TopicConfig[] {
  return TOPIC_CONFIGS.filter(t => level >= t.requiredLevel);
}

/** Get all locked topics for a given level */
export function getLockedTopics(level: number): TopicConfig[] {
  return TOPIC_CONFIGS.filter(t => level < t.requiredLevel);
}
