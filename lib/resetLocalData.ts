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
  'mock_tier_override',
  'core_values',
  'journey_progress',
  'hard_stop_active',
  'trial_start_date',
  'stealers_log',
  'victory_log',
];

// Deletes all 21 on-device journal entries (SecureStore, with the
// AsyncStorage fallback used when an entry was too large for SecureStore).
// Shared by full account resets (logout) and journey-cycle resets (Day 21
// -> reset to Day 1).
export async function clearAllJournals(): Promise<void> {
  await Promise.all(
    Array.from({ length: 21 }, (_, i) => i + 1).map(async (day) => {
      const key = `journal_day_${day}`;
      await SecureStore.deleteItemAsync(key).catch(() => {});
      await AsyncStorage.removeItem(key).catch(() => {});
    }),
  );
}

// Clears all locally-cached account data so a second user logging in on
// the same device never inherits the previous user's progress, journals,
// or onboarding answers.
export async function resetLocalUserData(): Promise<void> {
  await AsyncStorage.multiRemove(ACCOUNT_SCOPED_KEYS);
  await clearAllJournals();

  useUserStore.setState({
    onboarding: {},
    onboardingComplete: false,
    coreValues: [],
    flags: { tier: 'free', is_alumni: false, cohort_active: false, vip_flag: false },
  });
  useJourneyStore.setState({ progress: {}, currentDay: 1, hardStopActive: false });
  useToolStore.setState({ zenMode: false, stealersLog: {}, victoryLog: [] });
  useTrialStore.setState({ trialStartDate: null });
}
