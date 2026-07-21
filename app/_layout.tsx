import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, Platform, Alert } from 'react-native';
import {
  useFonts,
  Fraunces_300Light,
  Fraunces_400Regular,
  Fraunces_300Light_Italic,
  Fraunces_400Regular_Italic,
} from '@expo-google-fonts/fraunces';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import {
  DMMono_400Regular as DMMonoRegular,
} from '@expo-google-fonts/dm-mono';
import { useAuthStore } from '../store/useAuthStore';
import { useUserStore } from '../store/useUserStore';
import { useJourneyStore } from '../store/useJourneyStore';
import { useAudioStore } from '../store/useAudioStore';
import { useToolStore } from '../store/useToolStore';
import { useTrialStore } from '../store/useTrialStore';
import AmbientPlayer from '../components/ui/AmbientPlayer';
import { setupIAP, teardownIAP } from '../lib/iap';
import { checkAndPromptForUpdate } from '../lib/updates';
import { onSessionKicked } from '../lib/api';
import {
  requestNotificationPermission,
  hasAskedPermission,
  scheduleDaily,
  setupNotificationResponseListener,
} from '../lib/notifications';
import { Colors } from '../constants/colors';

function AuthGuard() {
  const router   = useRouter();
  const segments = useSegments();

  const { user, loading, loadCurrentUser } = useAuthStore();
  const { onboardingComplete, loadFromStorage } = useUserStore();
  const loadJourney = useJourneyStore((s) => s.loadFromStorage);
  const loadAudio   = useAudioStore((s) => s.loadFromStorage);
  const loadTools   = useToolStore((s) => s.loadFromStorage);
  const { loadFromStorage: loadTrial, isTrialExpired } = useTrialStore();

  useEffect(() => {
    const bootstrap = async () => {
      await Promise.all([loadFromStorage(), loadJourney(), loadAudio(), loadTools(), loadTrial()]);
      await loadCurrentUser();
    };
    bootstrap();
  }, []);

  useEffect(() => {
    if (loading) return;

    const inAuth      = segments[0] === '(auth)';
    const inApp       = segments[0] === '(app)';
    const onPaywall   = inAuth && (segments as string[])[1] === 'paywall';
    const userTier    = user?.tier ?? 'free';

    // 1. Not logged in → login
    if (!user) {
      if (!inAuth) router.replace('/(auth)/login');
      return;
    }

    // 2. Logged in but not onboarded → welcome flow
    if (!onboardingComplete) {
      const currentScreen = (segments as string[])[1] as string | undefined;
      const onAuthEntryScreen = currentScreen === 'login' || currentScreen === 'register';
      if (!inAuth || onAuthEntryScreen) router.replace('/(auth)/welcome');
      return;
    }

    // 3. Trial expired + free user → paywall (hard gate)
    if (userTier === 'free' && isTrialExpired() && !onPaywall) {
      router.replace('/(auth)/paywall');
      return;
    }

    // 4. All good → app
    if (!inApp && !onPaywall) router.replace('/(app)/');
  }, [user, loading, onboardingComplete, segments]);

  return null;
}

function SessionKickedManager() {
  useEffect(() => {
    return onSessionKicked(() => {
      // Tokens are already cleared by tryRefresh(); logout() additionally
      // wipes cached progress/journals so a shared-then-revoked device
      // doesn't keep showing another account's data.
      useAuthStore.getState().logout();
      Alert.alert(
        "You've been logged out",
        'Your account was signed in on another device, so this session was ended. Unstuck 21 allows one active login at a time.',
      );
    });
  }, []);
  return null;
}

function UpdateManager() {
  useEffect(() => {
    checkAndPromptForUpdate();
  }, []);
  return null;
}

function IAPManager() {
  useEffect(() => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      setupIAP();
      return () => { teardownIAP(); };
    }
  }, []);
  return null;
}

function NotificationManager() {
  const router = useRouter();

  useEffect(() => {
    // Ask for permission on first launch, then schedule the daily 8am reminder
    (async () => {
      const asked = await hasAskedPermission();
      if (!asked) {
        const granted = await requestNotificationPermission();
        if (granted) await scheduleDaily(8);
      }
    })();

    // Deep-link when user taps a notification while app is backgrounded/closed
    const cleanup = setupNotificationResponseListener((screen) => {
      if (screen === 'journey') router.push('/(app)/journey' as any);
    });
    return cleanup;
  }, []);

  return null;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Fraunces_300Light,
    Fraunces_400Regular,
    Fraunces_300Light_Italic,
    Fraunces_400Regular_Italic,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    DMMonoRegular,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.darkBase, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={Colors.tideMid} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="auto" translucent backgroundColor="transparent" />
      <AuthGuard />
      <SessionKickedManager />
      <UpdateManager />
      <IAPManager />
      <NotificationManager />
      <AmbientPlayer />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
      </Stack>
    </GestureHandlerRootView>
  );
}
