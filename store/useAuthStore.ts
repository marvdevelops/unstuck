import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, saveTokens, clearTokens, UserProfile } from '../lib/api';
import { resetLocalUserData } from '../lib/resetLocalData';

// Must match the literal in lib/iap.ts's mockPurchaseTier — see comment
// there for why this isn't a shared import (circular dependency).
const MOCK_TIER_KEY = 'mock_tier_override';

interface AuthStore {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadCurrentUser: () => Promise<void>;
  clearError: () => void;
  updateUser: (u: UserProfile) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { accessToken, refreshToken, user } = await api.auth.login(email, password);
      await saveTokens(accessToken, refreshToken);
      set({ user, loading: false });
    } catch (err: any) {
      set({ error: err.message ?? 'Login failed', loading: false });
    }
  },

  register: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { accessToken, refreshToken, user } = await api.auth.register(email, password);
      await saveTokens(accessToken, refreshToken);
      set({ user, loading: false });
    } catch (err: any) {
      set({ error: err.message ?? 'Registration failed', loading: false });
    }
  },

  logout: async () => {
    set({ loading: true });
    try { await api.auth.logout(); } catch {}
    await clearTokens();
    await resetLocalUserData();
    set({ user: null, loading: false });
  },

  loadCurrentUser: async () => {
    set({ loading: true });
    try {
      const user = await api.auth.me();
      // A mock IAP purchase (see lib/iap.ts) never touches the backend,
      // so the freshly-fetched profile would otherwise silently revert
      // the tier to whatever the server actually has. Reapply the local
      // override if one exists, so testing a "purchase" survives reloads.
      const mockTier = await AsyncStorage.getItem(MOCK_TIER_KEY);
      set({ user: mockTier ? { ...user, tier: mockTier as UserProfile['tier'] } : user, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },

  clearError: () => set({ error: null }),
  updateUser: (user) => set({ user }),
}));
