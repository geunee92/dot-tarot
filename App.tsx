import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, View, Text, Platform } from 'react-native';
import { useFonts, PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useRef } from 'react';
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';
import { RootNavigator } from './src/navigation';
import { initializeAds } from './src/services/ads';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    PressStart2P_400Regular,
    Galmuri11: require('./assets/fonts/Galmuri11.ttf'),
  });
  const adsInitialized = useRef(false);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // ATT dialog must appear AFTER splash is hidden — iOS rejects apps where ATT fires before UI is visible
  useEffect(() => {
    if (!fontsLoaded || adsInitialized.current) return;

    const initATTAndAds = async () => {
      if (Platform.OS === 'ios') {
        try {
          const { status } = await requestTrackingPermissionsAsync();
          if (__DEV__) console.log('[ATT] Tracking permission status:', status);
        } catch (e) {
          if (__DEV__) console.warn('[ATT] Permission request failed:', e);
        }
      }

      initializeAds();
      adsInitialized.current = true;
    };

    // Delay ensures splash is fully dismissed before ATT dialog appears
    const timer = setTimeout(initATTAndAds, 500);
    return () => clearTimeout(timer);
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>LOADING...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container} onLayout={onLayoutRootView}>
      <StatusBar style="light" />
      <RootNavigator />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0f0f23',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#f8b500',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
