import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import { SpreadTopic } from '../types';

export type MainTabParamList = {
  HomeTab: undefined;
  SpreadTab: undefined;
  JournalTab: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  TrainingResult: {
    dateKey: string;
    isNewDraw?: boolean;
  };
  QuestResult: {
    dateKey: string;
    spreadId: string;
    topic: SpreadTopic;
    isNewSpread?: boolean;
  };
  HistoryDetail: {
    dateKey: string;
  };
  Settings: undefined;
};

// Tab screen props
export type HomeScreenProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'HomeTab'>,
  NativeStackScreenProps<RootStackParamList>
>;

export type SpreadScreenProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'SpreadTab'>,
  NativeStackScreenProps<RootStackParamList>
>;

export type JournalScreenProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'JournalTab'>,
  NativeStackScreenProps<RootStackParamList>
>;

// Stack screen props
export type TrainingResultScreenProps = NativeStackScreenProps<RootStackParamList, 'TrainingResult'>;
export type QuestResultScreenProps = NativeStackScreenProps<RootStackParamList, 'QuestResult'>;
export type HistoryDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'HistoryDetail'>;
export type SettingsScreenProps = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export type RootStackNavigationProp = NativeStackScreenProps<RootStackParamList>['navigation'];
