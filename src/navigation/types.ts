import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SpreadTopic } from '../types';

export type RootStackParamList = {
  Home: undefined;
  DailyResult: {
    dateKey: string;
    isNewDraw?: boolean;
  };
  SpreadResult: {
    dateKey: string;
    spreadId: string;
    topic: SpreadTopic;
    isNewSpread?: boolean;
  };
  Deck: undefined;
  HistoryDetail: {
    dateKey: string;
  };
};

export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
export type DailyResultScreenProps = NativeStackScreenProps<RootStackParamList, 'DailyResult'>;
export type SpreadResultScreenProps = NativeStackScreenProps<RootStackParamList, 'SpreadResult'>;
export type DeckScreenProps = NativeStackScreenProps<RootStackParamList, 'Deck'>;
export type HistoryDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'HistoryDetail'>;

export type RootStackNavigationProp = HomeScreenProps['navigation'];
