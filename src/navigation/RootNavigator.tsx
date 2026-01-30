import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import {
  HomeScreen,
  DailyResultScreen,
  SpreadResultScreen,
  DeckScreen,
  HistoryDetailScreen,
} from '../screens';

const Stack = createNativeStackNavigator<RootStackParamList>();

const COLORS = {
  background: '#1a1a2e',
  surface: '#16213e',
  text: '#e0e0e0',
};

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: COLORS.surface,
          },
          headerTintColor: COLORS.text,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          contentStyle: {
            backgroundColor: COLORS.background,
          },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'Pixel Talisman',
            headerShown: false,
          }}
        />
        
        <Stack.Screen
          name="DailyResult"
          component={DailyResultScreen}
          options={{
            title: "Today's Card",
            animation: 'fade',
          }}
        />
        
        <Stack.Screen
          name="SpreadResult"
          component={SpreadResultScreen}
          options={({ route }) => ({
            title: `${route.params.topic} Reading`,
          })}
        />
        
        <Stack.Screen
          name="Deck"
          component={DeckScreen}
          options={{
            title: 'Card Backs',
          }}
        />
        
        <Stack.Screen
          name="HistoryDetail"
          component={HistoryDetailScreen}
          options={{
            title: 'Reading History',
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
