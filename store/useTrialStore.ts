import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY   = 'trial_start_date';
const TRIAL_DAYS    = 7;
const TRIAL_MS      = TRIAL_DAYS * 24 * 60 * 60 * 1000;

interface TrialStore {
  trialStartDate: string | null;   // ISO date string
  loadFromStorage: () => Promise<void>;
  markTrialStart:  () => Promise<void>;
  isTrialExpired:  () => boolean;
  daysRemaining:   () => number;   // 0 = expired
}

export const useTrialStore = create<TrialStore>((set, get) => ({
  trialStartDate: null,

  loadFromStorage: async () => {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) set({ trialStartDate: raw });
  },

  markTrialStart: async () => {
    if (get().trialStartDate) return;   // already marked — never overwrite
    const now = new Date().toISOString();
    await AsyncStorage.setItem(STORAGE_KEY, now);
    set({ trialStartDate: now });
  },

  isTrialExpired: () => {
    const { trialStartDate } = get();
    if (!trialStartDate) return false;  // not yet started
    return Date.now() - new Date(trialStartDate).getTime() > TRIAL_MS;
  },

  daysRemaining: () => {
    const { trialStartDate } = get();
    if (!trialStartDate) return TRIAL_DAYS;
    const elapsed = Date.now() - new Date(trialStartDate).getTime();
    const remaining = Math.ceil((TRIAL_MS - elapsed) / (24 * 60 * 60 * 1000));
    return Math.max(0, remaining);
  },
}));
