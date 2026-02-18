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
    questLabelKo: '떠돌이 의뢰',
    questLabelEn: 'Wandering Client',
    questDescKo: '막연한 고민을 안고 찾아온 의뢰인',
    questDescEn: 'A client with vague concerns seeks guidance',
  },
  {
    id: 'LOVE',
    emoji: '💕',
    requiredLevel: UNLOCK_TABLE.LOVE,
    hasQuestionInput: true,
    questLabelKo: '연애 전문 의뢰',
    questLabelEn: 'Love Consultation',
    questDescKo: '연애 고민을 가진 의뢰인이 찾아왔습니다',
    questDescEn: 'A client seeking advice about love and relationships',
  },
  {
    id: 'MONEY',
    emoji: '💰',
    requiredLevel: UNLOCK_TABLE.MONEY,
    hasQuestionInput: true,
    questLabelKo: '금전 전문 의뢰',
    questLabelEn: 'Finance Consultation',
    questDescKo: '금전 문제로 고민하는 의뢰인이 찾아왔습니다',
    questDescEn: 'A client seeking advice about finances and wealth',
  },
  {
    id: 'WORK',
    emoji: '💼',
    requiredLevel: UNLOCK_TABLE.WORK,
    hasQuestionInput: true,
    questLabelKo: '직장 전문 의뢰',
    questLabelEn: 'Career Consultation',
    questDescKo: '직장 고민을 안고 찾아온 의뢰인입니다',
    questDescEn: 'A client seeking advice about career and work',
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
