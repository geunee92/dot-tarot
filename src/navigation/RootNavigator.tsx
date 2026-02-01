import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { TabNavigator } from './TabNavigator';
import {
  DailyResultScreen,
  SpreadResultScreen,
  HistoryDetailScreen,
} from '../screens';
import { t } from '../i18n';

const Stack = createNativeStackNavigator<RootStackParamList>();

const COLORS = {
  background: '#0c0a1d',
  surface: '#1a1633',
  text: '#f5f5f5',
};

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="MainTabs"
        screenOptions={{
          headerStyle: {
            backgroundColor: COLORS.surface,
          },
          headerTintColor: COLORS.text,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerBackTitle: '',
          contentStyle: {
            backgroundColor: COLORS.background,
          },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen
          name="MainTabs"
          component={TabNavigator}
          options={{
            headerShown: false,
            title: '',
            headerBackTitle: ' ',
          }}
        />
        
        <Stack.Screen
          name="DailyResult"
          component={DailyResultScreen}
          options={{
            title: t('home.dailyCard'),
            animation: 'fade',
          }}
        />
        
        <Stack.Screen
          name="SpreadResult"
          component={SpreadResultScreen}
          options={({ route }) => ({
            title: `${t(`home.topics.${route.params.topic.toLowerCase()}`)} ${t('spreadResult.reading')}`,
          })}
        />
        
        <Stack.Screen
          name="HistoryDetail"
          component={HistoryDetailScreen}
          options={{
            title: t('history.title'),
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
