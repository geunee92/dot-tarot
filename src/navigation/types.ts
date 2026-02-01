import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import { SpreadTopic } from '../types';

// Tab navigator param list
export type MainTabParamList = {
  DailyTab: undefined;
  SpreadsTab: undefined;
  JourneyTab: undefined;
  SettingsTab: undefined;
};

// Root stack param list (includes tabs + modal screens)
export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
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
  HistoryDetail: {
    dateKey: string;
  };
};

// Screen props for tab screens
export type DailyScreenProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'DailyTab'>,
  NativeStackScreenProps<RootStackParamList>
>;

export type SpreadsScreenProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'SpreadsTab'>,
  NativeStackScreenProps<RootStackParamList>
>;

export type JourneyScreenProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'JourneyTab'>,
  NativeStackScreenProps<RootStackParamList>
>;

export type SettingsScreenProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'SettingsTab'>,
  NativeStackScreenProps<RootStackParamList>
>;

// Screen props for stack screens (modals)
export type DailyResultScreenProps = NativeStackScreenProps<RootStackParamList, 'DailyResult'>;
export type SpreadResultScreenProps = NativeStackScreenProps<RootStackParamList, 'SpreadResult'>;
export type HistoryDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'HistoryDetail'>;

export type RootStackNavigationProp = NativeStackScreenProps<RootStackParamList>['navigation'];
