/**
 * AdMob Rewarded Ads Service
 * 
 * Uses react-native-google-mobile-ads for real ads in development builds.
 * Falls back to mock implementation for Expo Go testing.
 * 
 * Test Ad Unit IDs (Google provided):
 * - Android Rewarded: ca-app-pub-3940256099942544/5224354917
 * - iOS Rewarded: ca-app-pub-3940256099942544/1712485313
 */

import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Check if running in Expo Go (no native modules)
const isExpoGo = Constants.appOwnership === 'expo';

// Google's official test ad unit IDs (for development builds)
const TEST_REWARDED_AD_UNIT_ID = Platform.select({
  android: 'ca-app-pub-3940256099942544/5224354917',
  ios: 'ca-app-pub-3940256099942544/1712485313',
  default: 'ca-app-pub-3940256099942544/5224354917',
});

// Production ad unit IDs
const PRODUCTION_REWARDED_AD_UNIT_ID = Platform.select({
  android: 'ca-app-pub-5957078713826547/7178538743',
  ios: 'ca-app-pub-5957078713826547/1324981807',
  default: 'ca-app-pub-5957078713826547/7178538743',
});

const REWARDED_AD_UNIT_ID = __DEV__ ? TEST_REWARDED_AD_UNIT_ID : PRODUCTION_REWARDED_AD_UNIT_ID;

// ============================================
// Types
// ============================================

type RewardCallback = (reward: { type: string; amount: number }) => void;
type ErrorCallback = (error: Error) => void;

export interface ShowAdOptions {
  onRewarded: RewardCallback;
  onError?: ErrorCallback;
  onClosed?: () => void;
}

// ============================================
// State
// ============================================

let adLoaded = false;
let adLoading = false;
let rewardedAd: any = null;

// ============================================
// Mock Implementation (for Expo Go)
// ============================================

const mockAds = {
  initialize: () => {},
  
  load: () => {
    adLoaded = true;
  },
  
  show: async (options: ShowAdOptions): Promise<boolean> => {
    const { onRewarded, onClosed } = options;
    
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    onRewarded({ type: 'reward', amount: 1 });
    onClosed?.();
    
    return true;
  },
  
  isReady: () => true,
  isLoading: () => false,
  cleanup: () => {},
};

// ============================================
// Real AdMob Implementation
// ============================================

let mobileAds: any = null;
let RewardedAd: any = null;
let RewardedAdEventType: any = null;
let AdEventType: any = null;

async function loadNativeModules() {
  if (isExpoGo) return false;
  
  try {
    const googleMobileAds = await import('react-native-google-mobile-ads');
    mobileAds = googleMobileAds.default;
    RewardedAd = googleMobileAds.RewardedAd;
    RewardedAdEventType = googleMobileAds.RewardedAdEventType;
    AdEventType = googleMobileAds.AdEventType;
    return true;
  } catch {
    return false;
  }
}

const realAds = {
  initialize: async () => {
    const loaded = await loadNativeModules();
    if (!loaded || !mobileAds) {
      return;
    }
    
    try {
      await mobileAds().initialize();
      if (__DEV__) console.log('[AdMob] Initialized, loading ad with', __DEV__ ? 'TEST' : 'PRODUCTION', 'unit ID');
      realAds.load();
    } catch (e) {
      if (__DEV__) console.warn('[AdMob] Init failed:', e);
    }
  },
  
  load: () => {
    if (!RewardedAd || !REWARDED_AD_UNIT_ID) {
      return;
    }
    
    if (adLoading) {
      return;
    }
    
    adLoading = true;
    adLoaded = false;
    
    try {
      rewardedAd = RewardedAd.createForAdRequest(REWARDED_AD_UNIT_ID, {
        keywords: ['tarot', 'fortune', 'horoscope', 'spirituality'],
      });
      
      const unsubscribeLoaded = rewardedAd.addAdEventListener(
        RewardedAdEventType.LOADED,
        () => {
          adLoaded = true;
          adLoading = false;
        }
      );
      
      const unsubscribeError = rewardedAd.addAdEventListener(
        AdEventType.ERROR,
        (error: any) => {
          if (__DEV__) console.warn('[AdMob] Load error:', error?.message || error);
          adLoaded = false;
          adLoading = false;
          setTimeout(() => realAds.load(), 5000);
        }
      );
      
      rewardedAd.load();
      
      (rewardedAd as any)._unsubscribers = [unsubscribeLoaded, unsubscribeError];
    } catch {
      adLoading = false;
    }
  },
  
  show: async (options: ShowAdOptions): Promise<boolean> => {
    const { onRewarded, onError, onClosed } = options;
    
    if (!rewardedAd || !adLoaded) {
      onError?.(new Error('Ad not ready'));
      realAds.load();
      return false;
    }
    
    return new Promise((resolve) => {
      let rewarded = false;
      
      const unsubscribeEarned = rewardedAd.addAdEventListener(
        RewardedAdEventType.EARNED_REWARD,
        (reward: any) => {
          rewarded = true;
          onRewarded({
            type: reward.type || 'reward',
            amount: reward.amount || 1,
          });
        }
      );
      
      const unsubscribeClosed = rewardedAd.addAdEventListener(
        AdEventType.CLOSED,
        () => {
          unsubscribeEarned();
          unsubscribeClosed();
          onClosed?.();
          
          adLoaded = false;
          rewardedAd = null;
          realAds.load();
          
          resolve(rewarded);
        }
      );
      
      try {
        rewardedAd.show();
      } catch (e) {
        unsubscribeEarned();
        unsubscribeClosed();
        onError?.(e as Error);
        resolve(false);
      }
    });
  },
  
  isReady: () => adLoaded && rewardedAd !== null,
  isLoading: () => adLoading,
  
  cleanup: () => {
    if (rewardedAd && (rewardedAd as any)._unsubscribers) {
      (rewardedAd as any)._unsubscribers.forEach((unsub: () => void) => unsub());
    }
    rewardedAd = null;
    adLoaded = false;
    adLoading = false;
  },
};

// ============================================
// Exported API (auto-selects mock or real)
// ============================================

export function initializeAds(): void {
  if (isExpoGo) {
    mockAds.initialize();
    mockAds.load();
  } else {
    realAds.initialize();
  }
}

export function loadAd(): void {
  if (isExpoGo) {
    mockAds.load();
  } else {
    realAds.load();
  }
}

export async function showRewardedAd(options: ShowAdOptions): Promise<boolean> {
  if (isExpoGo) {
    return mockAds.show(options);
  }
  return realAds.show(options);
}

export function isAdReady(): boolean {
  if (isExpoGo) {
    return mockAds.isReady();
  }
  return realAds.isReady();
}

export function isAdCurrentlyLoading(): boolean {
  if (isExpoGo) {
    return mockAds.isLoading();
  }
  return realAds.isLoading();
}

export function cleanupAds(): void {
  if (isExpoGo) {
    mockAds.cleanup();
  } else {
    realAds.cleanup();
  }
}
