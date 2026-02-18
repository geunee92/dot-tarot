import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { TabNavigator } from './TabNavigator';
import {
  TrainingResultScreen,
  QuestResultScreen,
  HistoryDetailScreen,
} from '../screens';
import { COLORS } from '../components';
import { t } from '../i18n';

const Stack = createNativeStackNavigator<RootStackParamList>();

const NAV_COLORS = {
  background: COLORS.background,
  surface: COLORS.surface,
  text: COLORS.text,
};

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="MainTabs"
        screenOptions={{
          headerStyle: {
            backgroundColor: NAV_COLORS.surface,
          },
          headerTintColor: NAV_COLORS.text,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerBackTitle: '',
          contentStyle: {
            backgroundColor: NAV_COLORS.background,
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
          name="TrainingResult"
          component={TrainingResultScreen}
          options={{
            title: t('talisman.title'),
            animation: 'fade',
          }}
        />
        
         <Stack.Screen
           name="QuestResult"
            component={QuestResultScreen}
            options={({ route }) => ({
              title: t('spread.resultTitle'),
              animation: 'fade_from_bottom',
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
