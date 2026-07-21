import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { useUserStore } from '../store/useUserStore';
import { useJourneyStore } from '../store/useJourneyStore';
import { useToolStore } from '../store/useToolStore';
import { useTrialStore } from '../store/useTrialStore';

// Account-scoped keys only — device-level prefs (ambient_enabled,
// notif_reminder_hour/minute) intentionally survive logout.
const ACCOUNT_SCOPED_KEYS = [
  'onboarding_data',
  'user_tier',
  'core_values',
  'journey_progress',
  'hard_stop_active',
  'trial_start_date',
  'stealers_log',
  'victory_log',
];

// Clears all locally-cached account data so a second user logging in on
// the same device never inherits the previous user's progress, journals,
// or onboarding answers.
export async function resetLocalUserData(): Promise<void> {
  await AsyncStorage.multiRemove(ACCOUNT_SCOPED_KEYS);

  await Promise.all(
    Array.from({ length: 21 }, (_, i) => i + 1).map(async (day) => {
      const key = `journal_day_${day}`;
      await SecureStore.deleteItemAsync(key).catch(() => {});
      await AsyncStorage.removeItem(key).catch(() => {});
    }),
  );

  useUserStore.setState({
    onboarding: {},
    onboardingComplete: false,
    coreValues: [],
    flags: { tier: 'basic', is_alumni: false, cohort_active: false, vip_flag: false },
  });
  useJourneyStore.setState({ progress: {}, currentDay: 1, hardStopActive: false });
  useToolStore.setState({ zenMode: false, stealersLog: {}, victoryLog: [] });
  useTrialStore.setState({ trialStartDate: null });
}
