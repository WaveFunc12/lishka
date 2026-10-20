import { Platform, Share } from 'react-native';

/** Open the phone's share sheet. Where there is none (a desktop browser, an embedded page), copy the text instead.
    Resolves to what happened, so the screen can say "copied". */
export async function shareText(message: string): Promise<'shared' | 'copied' | 'failed'> {
  // On the web, copy first while the tap still counts as the user's: browsers refuse the clipboard once it has passed.
  const copy = Platform.OS === 'web' ? navigator.clipboard?.writeText(message).then(() => true, () => false) : null;
  try {
    await Share.share({ message });
    return 'shared';
  } catch {
    return (await copy) ? 'copied' : 'failed';
  }
}

/** Share a picture (a captured view's file) with the text beside it. iOS sends both; where pictures can't go
    (the web), it falls back to the text alone. */
export async function shareImage(message: string, capture: () => Promise<string>): Promise<'shared' | 'copied' | 'failed'> {
  if (Platform.OS === 'web') return shareText(message);
  try {
    const url = await capture();
    await Share.share(Platform.OS === 'ios' ? { message, url } : { message });
    return 'shared';
  } catch {
    return shareText(message);
  }
}
