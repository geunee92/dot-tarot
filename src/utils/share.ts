import * as ExpoSharing from 'expo-sharing';

interface ShareOptions {
  imageUri: string;
  message: string;
}

export async function shareImage({ imageUri }: ShareOptions): Promise<boolean> {
  const fileUri = imageUri.startsWith('file://') ? imageUri : `file://${imageUri}`;
  
  const isAvailable = await ExpoSharing.isAvailableAsync();
  if (!isAvailable) {
    throw new Error('Sharing is not available on this device');
  }
  
  await ExpoSharing.shareAsync(fileUri, {
    mimeType: 'image/png',
    UTI: 'image/png',
  });
  return true;
}
