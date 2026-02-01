/**
 * Mock Ads Service for Expo Go testing
 * Replace with real implementation when using Development Build
 */

type RewardCallback = (reward: { type: string; amount: number }) => void;
type ErrorCallback = (error: Error) => void;

export function initializeAds(): void {
  console.log('[Ads Mock] Initialized - using mock for Expo Go testing');
}

export function loadAd(): void {
  console.log('[Ads Mock] Ad loaded (mock)');
}

export interface ShowAdOptions {
  onRewarded: RewardCallback;
  onError?: ErrorCallback;
  onClosed?: () => void;
}

export async function showRewardedAd(options: ShowAdOptions): Promise<boolean> {
  const { onRewarded, onClosed } = options;

  console.log('[Ads Mock] Showing mock ad - auto-rewarding in 1 second');
  
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  onRewarded({ type: 'coins', amount: 1 });
  onClosed?.();
  
  return true;
}

export function isAdReady(): boolean {
  return true;
}

export function isAdCurrentlyLoading(): boolean {
  return false;
}

export function cleanupAds(): void {
  console.log('[Ads Mock] Cleanup');
}
