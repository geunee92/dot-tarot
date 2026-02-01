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

// Test ad unit IDs (replace with production IDs before release)
const REWARDED_AD_UNIT_ID = Platform.select({
  android: 'ca-app-pub-3940256099942544/5224354917',
  ios: 'ca-app-pub-3940256099942544/1712485313',
  default: 'ca-app-pub-3940256099942544/5224354917',
});

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
  initialize: () => {
    console.log('[Ads Mock] Initialized - using mock for Expo Go testing');
  },
  
  load: () => {
    console.log('[Ads Mock] Ad loaded (mock)');
    adLoaded = true;
  },
  
  show: async (options: ShowAdOptions): Promise<boolean> => {
    const { onRewarded, onClosed } = options;
    
    console.log('[Ads Mock] Showing mock ad - auto-rewarding in 1.5 seconds');
    
    // Simulate ad watching time
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    onRewarded({ type: 'reward', amount: 1 });
    onClosed?.();
    
    return true;
  },
  
  isReady: () => true,
  isLoading: () => false,
  cleanup: () => {
    console.log('[Ads Mock] Cleanup');
  },
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
  } catch (e) {
    console.log('[Ads] Failed to load native modules, using mock:', e);
    return false;
  }
}

const realAds = {
  initialize: async () => {
    const loaded = await loadNativeModules();
    if (!loaded || !mobileAds) {
      console.log('[Ads] Native modules not available, falling back to mock');
      return;
    }
    
    try {
      await mobileAds().initialize();
      console.log('[Ads] AdMob initialized successfully');
      realAds.load();
    } catch (e) {
      console.error('[Ads] Failed to initialize AdMob:', e);
    }
  },
  
  load: () => {
    if (!RewardedAd || !REWARDED_AD_UNIT_ID) {
      console.log('[Ads] Cannot load - modules not available');
      return;
    }
    
    if (adLoading) {
      console.log('[Ads] Already loading ad');
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
          console.log('[Ads] Rewarded ad loaded');
          adLoaded = true;
          adLoading = false;
        }
      );
      
      const unsubscribeError = rewardedAd.addAdEventListener(
        AdEventType.ERROR,
        (error: any) => {
          console.error('[Ads] Failed to load ad:', error);
          adLoaded = false;
          adLoading = false;
          // Retry after delay
          setTimeout(() => realAds.load(), 5000);
        }
      );
      
      rewardedAd.load();
      
      // Store unsubscribers for cleanup
      (rewardedAd as any)._unsubscribers = [unsubscribeLoaded, unsubscribeError];
    } catch (e) {
      console.error('[Ads] Error creating ad request:', e);
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
          console.log('[Ads] User earned reward:', reward);
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
          console.log('[Ads] Ad closed, rewarded:', rewarded);
          unsubscribeEarned();
          unsubscribeClosed();
          onClosed?.();
          
          // Reset and preload next ad
          adLoaded = false;
          rewardedAd = null;
          realAds.load();
          
          resolve(rewarded);
        }
      );
      
      try {
        rewardedAd.show();
      } catch (e) {
        console.error('[Ads] Error showing ad:', e);
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
    console.log('[Ads] Cleanup complete');
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
