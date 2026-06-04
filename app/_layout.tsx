import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, Platform } from 'react-native';
import {
  useFonts,
  DMSerifDisplay_400Regular,
} from '@expo-google-fonts/dm-serif-display';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import {
  IBMPlexMono_400Regular,
} from '@expo-google-fonts/ibm-plex-mono';
import { useAuthStore } from '../store/useAuthStore';
import { useUserStore } from '../store/useUserStore';
import { useJourneyStore } from '../store/useJourneyStore';
import { useAudioStore } from '../store/useAudioStore';
import { useToolStore } from '../store/useToolStore';
import AmbientPlayer from '../components/ui/AmbientPlayer';
import { setupIAP, teardownIAP } from '../lib/iap';
import { Colors } from '../constants/colors';

function AuthGuard() {
  const router = useRouter();
  const segments = useSegments();
  const { user, loading, loadCurrentUser } = useAuthStore();
  const { onboardingComplete, loadFromStorage } = useUserStore();
  const loadJourney = useJourneyStore((s) => s.loadFromStorage);
  const loadAudio = useAudioStore((s) => s.loadFromStorage);
  const loadTools = useToolStore((s) => s.loadFromStorage);

  useEffect(() => {
    const bootstrap = async () => {
      await Promise.all([loadFromStorage(), loadJourney(), loadAudio(), loadTools()]);
      await loadCurrentUser();
    };
    bootstrap();
  }, []);

  useEffect(() => {
    if (loading) return;
    const inAuth = segments[0] === '(auth)';
    const inApp = segments[0] === '(app)';

    if (!user) {
      if (!inAuth) router.replace('/(auth)/login');
      return;
    }
    if (!onboardingComplete) {
      const currentScreen = (segments as string[])[1] as string | undefined;
      const onAuthEntryScreen = currentScreen === 'login' || currentScreen === 'register';
      if (!inAuth || onAuthEntryScreen) router.replace('/(auth)/welcome');
      return;
    }
    if (!inApp) router.replace('/(app)/');
  }, [user, loading, onboardingComplete, segments]);

  return null;
}

function IAPManager() {
  useEffect(() => {
    // IAP only available on native platforms
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      setupIAP();
      return () => { teardownIAP(); };
    }
  }, []);
  return null;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    DMSerifDisplay_400Regular,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
    IBMPlexMono_400Regular,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.darkNavy, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={Colors.primaryBlue} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="auto" />
      <AuthGuard />
      <IAPManager />
      <AmbientPlayer />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
      </Stack>
    </GestureHandlerRootView>
  );
}
