import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AttentionStealer {
  label: string;
  count: number;
}

export interface VictoryEntry {
  mood: string;
  text: string;
  date: string;
}

interface ToolStore {
  zenMode: boolean;
  stealersLog: Record<string, number>;
  victoryLog: VictoryEntry[];
  toggleZenMode: () => void;
  logStealer: (label: string) => Promise<void>;
  addVictory: (entry: VictoryEntry) => Promise<void>;
  loadFromStorage: () => Promise<void>;
  topStealers: () => AttentionStealer[];
}

export const useToolStore = create<ToolStore>((set, get) => ({
  zenMode: false,
  stealersLog: {},
  victoryLog: [],

  toggleZenMode: () => set((s) => ({ zenMode: !s.zenMode })),

  logStealer: async (label) => {
    set((s) => {
      const log = { ...s.stealersLog, [label]: (s.stealersLog[label] ?? 0) + 1 };
      AsyncStorage.setItem('stealers_log', JSON.stringify(log));
      return { stealersLog: log };
    });
  },

  addVictory: async (entry) => {
    set((s) => {
      const log = [entry, ...s.victoryLog];
      AsyncStorage.setItem('victory_log', JSON.stringify(log));
      return { victoryLog: log };
    });
  },

  loadFromStorage: async () => {
    const sl = await AsyncStorage.getItem('stealers_log');
    if (sl) set({ stealersLog: JSON.parse(sl) });
    const vl = await AsyncStorage.getItem('victory_log');
    if (vl) set({ victoryLog: JSON.parse(vl) });
  },

  topStealers: () => {
    const { stealersLog } = get();
    return Object.entries(stealersLog)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  },
}));
