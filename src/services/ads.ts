import {
  RewardedAd,
  RewardedAdEventType,
  TestIds,
  AdEventType,
} from 'react-native-google-mobile-ads';

const AD_UNIT_ID = __DEV__ ? TestIds.REWARDED : TestIds.REWARDED;

let rewardedAd: RewardedAd | null = null;
let isAdLoading = false;
let isAdLoaded = false;

type RewardCallback = (reward: { type: string; amount: number }) => void;
type ErrorCallback = (error: Error) => void;

let onRewardEarned: RewardCallback | null = null;
let onAdError: ErrorCallback | null = null;
let onAdClosed: (() => void) | null = null;

export function initializeAds(): void {
  if (rewardedAd) return;
  
  rewardedAd = RewardedAd.createForAdRequest(AD_UNIT_ID, {
    requestNonPersonalizedAdsOnly: true,
  });

  rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
    console.log('[Ads] Rewarded ad loaded');
    isAdLoaded = true;
    isAdLoading = false;
  });

  rewardedAd.addAdEventListener(RewardedAdEventType.EARNED_REWARD, (reward) => {
    console.log('[Ads] User earned reward:', reward.type, reward.amount);
    if (onRewardEarned) {
      onRewardEarned(reward);
    }
  });

  rewardedAd.addAdEventListener(AdEventType.CLOSED, () => {
    console.log('[Ads] Ad closed');
    isAdLoaded = false;
    if (onAdClosed) {
      onAdClosed();
    }
    loadAd();
  });

  rewardedAd.addAdEventListener(AdEventType.ERROR, (error) => {
    console.error('[Ads] Ad error:', error);
    isAdLoaded = false;
    isAdLoading = false;
    if (onAdError) {
      onAdError(new Error(error.message));
    }
  });

  loadAd();
}

export function loadAd(): void {
  if (!rewardedAd || isAdLoading || isAdLoaded) return;
  
  console.log('[Ads] Loading rewarded ad...');
  isAdLoading = true;
  rewardedAd.load();
}

export interface ShowAdOptions {
  onRewarded: RewardCallback;
  onError?: ErrorCallback;
  onClosed?: () => void;
}

export async function showRewardedAd(options: ShowAdOptions): Promise<boolean> {
  const { onRewarded, onError, onClosed } = options;

  if (!rewardedAd) {
    console.error('[Ads] Ad not initialized');
    onError?.(new Error('Ad not initialized'));
    return false;
  }

  if (!isAdLoaded) {
    console.error('[Ads] Ad not loaded yet');
    onError?.(new Error('Ad not ready. Please try again.'));
    loadAd();
    return false;
  }

  onRewardEarned = onRewarded;
  onAdError = onError || null;
  onAdClosed = onClosed || null;

  try {
    await rewardedAd.show();
    return true;
  } catch (error) {
    console.error('[Ads] Error showing ad:', error);
    onError?.(error as Error);
    return false;
  }
}

export function isAdReady(): boolean {
  return isAdLoaded;
}

export function isAdCurrentlyLoading(): boolean {
  return isAdLoading;
}

export function cleanupAds(): void {
  if (rewardedAd) {
    rewardedAd.removeAllListeners();
    rewardedAd = null;
  }
  isAdLoaded = false;
  isAdLoading = false;
  onRewardEarned = null;
  onAdError = null;
  onAdClosed = null;
}
