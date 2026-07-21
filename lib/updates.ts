import * as Updates from 'expo-updates';
import { Alert } from 'react-native';

// Checks the current channel for a published EAS Update, downloads it if
// one exists, and offers an immediate restart instead of waiting for the
// default apply-on-next-cold-start behavior. No-op in dev/Expo Go, where
// expo-updates is disabled.
export async function checkAndPromptForUpdate(): Promise<void> {
  if (__DEV__ || !Updates.isEnabled) return;

  try {
    const result = await Updates.checkForUpdateAsync();
    if (!result.isAvailable) return;

    await Updates.fetchUpdateAsync();

    Alert.alert(
      'Update ready',
      'A new version of Unstuck 21 is ready. Restart now to apply it?',
      [
        { text: 'Later', style: 'cancel' },
        { text: 'Restart', onPress: () => Updates.reloadAsync() },
      ],
    );
  } catch {
    // Silent — a failed update check shouldn't interrupt the session
  }
}
