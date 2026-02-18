import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import { SpreadTopic } from '../types';

export type MainTabParamList = {
  CharacterTab: undefined;
  TalismanTab: undefined;
  SpreadTab: undefined;
  LogTab: undefined;
  SettingsTab: undefined;
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
};

// Tab screen props
export type CharacterScreenProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'CharacterTab'>,
  NativeStackScreenProps<RootStackParamList>
>;

export type TalismanScreenProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'TalismanTab'>,
  NativeStackScreenProps<RootStackParamList>
>;

export type SpreadScreenProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'SpreadTab'>,
  NativeStackScreenProps<RootStackParamList>
>;

export type TrainingLogScreenProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'LogTab'>,
  NativeStackScreenProps<RootStackParamList>
>;

export type SettingsScreenProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'SettingsTab'>,
  NativeStackScreenProps<RootStackParamList>
>;

// Stack screen props
export type TrainingResultScreenProps = NativeStackScreenProps<RootStackParamList, 'TrainingResult'>;
export type QuestResultScreenProps = NativeStackScreenProps<RootStackParamList, 'QuestResult'>;
export type HistoryDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'HistoryDetail'>;

export type RootStackNavigationProp = NativeStackScreenProps<RootStackParamList>['navigation'];
