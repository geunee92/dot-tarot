import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { MainTabParamList } from './types';
import {
  CharacterScreen,
  TalismanScreen,
  QuestBoardScreen,
  TrainingLogScreen,
  SettingsScreen,
} from '../screens';
import { PixelText, COLORS, SPACING, BORDERS, FONTS, SHADOWS } from '../components';
import { useTranslation } from '../i18n';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_CONFIG = [
  { name: 'CharacterTab' as const, icon: '★', labelKey: 'tabs.character' },
  { name: 'TalismanTab' as const, icon: '✦', labelKey: 'tabs.talisman' },
  { name: 'SpreadTab' as const, icon: '♦', labelKey: 'tabs.spread' },
  { name: 'LogTab' as const, icon: '◆', labelKey: 'tabs.records' },
  { name: 'SettingsTab' as const, icon: '●', labelKey: 'tabs.settings' },
];

function PixelTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.tabBar}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const tabConfig = TAB_CONFIG.find((tab) => tab.name === route.name);
        
        if (!tabConfig) return null;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            style={[styles.tabItem, isFocused && styles.tabItemFocused]}
          >
            <View style={[styles.iconContainer, isFocused && styles.iconContainerFocused]}>
              <PixelText variant="body" style={isFocused ? styles.tabIconFocused : styles.tabIcon}>
                {tabConfig.icon}
              </PixelText>
            </View>
            <PixelText
              variant="caption"
              style={isFocused ? styles.tabLabelFocused : styles.tabLabel}
            >
              {t(tabConfig.labelKey)}
            </PixelText>
          </Pressable>
        );
      })}
    </View>
  );
}

export function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <PixelTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="CharacterTab" component={CharacterScreen} />
      <Tab.Screen name="TalismanTab" component={TalismanScreen} />
      <Tab.Screen name="SpreadTab" component={QuestBoardScreen} />
      <Tab.Screen name="LogTab" component={TrainingLogScreen} />
      <Tab.Screen name="SettingsTab" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderTopWidth: BORDERS.medium,
    borderTopColor: COLORS.border,
    paddingBottom: SPACING.md,
    paddingTop: SPACING.sm,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xs,
  },
  tabItemFocused: {},
  iconContainer: {
    width: 36,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    borderWidth: BORDERS.thin,
    borderColor: 'transparent',
  },
  iconContainerFocused: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.accent,
    ...SHADOWS.blockLight,
  },
  tabIcon: {
    fontSize: FONTS.lg,
    color: COLORS.textMuted,
  },
  tabIconFocused: {
    fontSize: FONTS.lg,
    color: COLORS.accent,
  },
  tabLabel: {
    color: COLORS.textMuted,
    fontSize: FONTS.xs,
  },
  tabLabelFocused: {
    color: COLORS.accent,
    fontWeight: 'bold',
    fontSize: FONTS.xs,
  },
});
