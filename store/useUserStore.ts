import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  },

  setCoreValues: async (values) => {
    set({ coreValues: values });
    await AsyncStorage.setItem('core_values', JSON.stringify(values));
  },

  loadFromStorage: async () => {
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
  },
}));
