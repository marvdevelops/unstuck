import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../lib/api';

export type StuckPattern = 'restart_loop' | 'overwhelm' | 'focus' | 'direction' | 'urgency';
export type Goal = 'morning_ownership' | 'deep_focus' | 'calm_control' | 'lasting_habit' | 'identity_alignment';
export type AccountabilityStyle = 'solo' | 'community' | 'direct' | 'flexible';
export type UserTier = 'basic' | 'cohort' | 'vip';

export interface OnboardingData {
  stuck_pattern?: StuckPattern;
  goal?: Goal;
  accountability_style?: AccountabilityStyle;
  first_name?: string;
}

export interface UserFlags {
  tier: UserTier;
  is_alumni: boolean;
  cohort_active: boolean;
  vip_flag: boolean;
}

interface UserStore {
  onboarding: OnboardingData;
  flags: UserFlags;
  onboardingComplete: boolean;
  coreValues: string[];
  setOnboardingField: <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => void;
  completeOnboarding: () => Promise<void>;
  setCoreValues: (values: string[]) => Promise<void>;
  loadFromStorage: () => Promise<void>;
}

const DEFAULT_FLAGS: UserFlags = {
  tier: 'basic',
  is_alumni: false,
  cohort_active: false,
  vip_flag: false,
};

export const useUserStore = create<UserStore>((set, get) => ({
  onboarding: {},
  flags: DEFAULT_FLAGS,
  onboardingComplete: false,
  coreValues: [],

  setOnboardingField: (key, value) =>
    set((s) => ({ onboarding: { ...s.onboarding, [key]: value } })),

  completeOnboarding: async () => {
    const { onboarding } = get();
    await AsyncStorage.setItem('onboarding_data', JSON.stringify(onboarding));
    set({ onboardingComplete: true });
    try {
      await api.auth.saveOnboarding(onboarding);
    } catch {
      // Offline-first — local state is source of truth; will sync on next app open
    }
  },

  setCoreValues: async (values) => {
    set({ coreValues: values });
    await AsyncStorage.setItem('core_values', JSON.stringify(values));
    try {
      await api.auth.saveCoreValues(values);
    } catch {
      // Offline-first — local state is source of truth; will sync on next app open
    }
  },

  loadFromStorage: async () => {
    // Seed from local cache first for instant startup
    const raw = await AsyncStorage.getItem('onboarding_data');
    if (raw) {
      const onboarding: OnboardingData = JSON.parse(raw);
      set({ onboarding, onboardingComplete: !!onboarding.first_name });
    }
    const tierRaw = await AsyncStorage.getItem('user_tier');
    if (tierRaw) {
      set((s) => ({ flags: { ...s.flags, tier: tierRaw as UserTier } }));
    }
    const cvRaw = await AsyncStorage.getItem('core_values');
    if (cvRaw) {
      set({ coreValues: JSON.parse(cvRaw) });
    }

    // Then fetch authoritative data from API (handles multi-device sync)
    try {
      const profile = await api.auth.me();
      set((s) => ({
        onboarding: {
          stuck_pattern: (profile.stuckPattern as OnboardingData['stuck_pattern']) ?? s.onboarding.stuck_pattern,
          goal: (profile.goal as OnboardingData['goal']) ?? s.onboarding.goal,
          accountability_style: (profile.accountabilityStyle as OnboardingData['accountability_style']) ?? s.onboarding.accountability_style,
          first_name: profile.firstName ?? s.onboarding.first_name,
        },
        // Never let a missing/stale server value downgrade onboarding
        // that was already completed locally (e.g. saveOnboarding hasn't
        // synced yet, or the app is offline).
        onboardingComplete: !!profile.firstName || s.onboardingComplete,
        flags: {
          ...s.flags,
          tier: (profile.tier === 'free' ? 'basic' : profile.tier) as UserTier,
          is_alumni: profile.isAlumni,
          vip_flag: profile.vipFlag,
        },
        coreValues: profile.coreValues?.length ? profile.coreValues : s.coreValues,
      }));
      // Keep local cache in sync
      if (profile.coreValues?.length) {
        await AsyncStorage.setItem('core_values', JSON.stringify(profile.coreValues));
      }

      // Self-heal: users who completed onboarding before saveOnboarding()
      // was wired up have a real local record but a blank server record.
      // Push it up once so it stops relying on the local-cache fallback.
      const { onboarding: current, onboardingComplete: completeNow } = get();
      if (!profile.firstName && completeNow && current.first_name) {
        api.auth.saveOnboarding(current).catch(() => {});
      }
    } catch {
      // Not logged in yet or offline — local cache stays
    }
  },
}));
