import { create } from 'zustand';
import { api, saveTokens, clearTokens, UserProfile } from '../lib/api';

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
    set({ user: null, loading: false });
  },

  loadCurrentUser: async () => {
    set({ loading: true });
    try {
      const user = await api.auth.me();
      set({ user, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },

  clearError: () => set({ error: null }),
  updateUser: (user) => set({ user }),
}));
