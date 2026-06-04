import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AudioStore {
  ambientEnabled: boolean;
  ambientVolume: number;
  toggleAmbient: () => Promise<void>;
  setAmbientVolume: (v: number) => void;
  loadFromStorage: () => Promise<void>;
}

export const useAudioStore = create<AudioStore>((set, get) => ({
  ambientEnabled: true,
  ambientVolume: 0.2,

  toggleAmbient: async () => {
    set((s) => {
      const next = !s.ambientEnabled;
      AsyncStorage.setItem('ambient_enabled', JSON.stringify(next));
      return { ambientEnabled: next };
    });
  },

  setAmbientVolume: (v) => set({ ambientVolume: v }),

  loadFromStorage: async () => {
    const raw = await AsyncStorage.getItem('ambient_enabled');
    if (raw !== null) set({ ambientEnabled: JSON.parse(raw) });
  },
}));
