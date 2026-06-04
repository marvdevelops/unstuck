import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { api } from '../lib/api';

export interface DayState {
  videoWatched: boolean;
  routineTasks: boolean[];
  spotTasks: boolean[];
  journal: string;
  celebrated: boolean;
}

interface JourneyStore {
  progress: Record<number, DayState>;
  currentDay: number;
  hardStopActive: boolean;
  initDay: (day: number, routineLen: number, spotLen: number) => void;
  toggleRoutineTask: (day: number, index: number) => Promise<void>;
  toggleSpotTask: (day: number, index: number) => Promise<void>;
  markVideoWatched: (day: number) => Promise<void>;
  setJournal: (day: number, text: string) => void;
  saveJournal: (day: number) => Promise<void>;
  markCelebrated: (day: number) => Promise<void>;
  toggleHardStop: () => Promise<void>;
  loadFromStorage: () => Promise<void>;
  isDayComplete: (day: number) => boolean;
  isDayUnlocked: (day: number) => boolean;
}

const JOURNAL_KEY = (day: number) => `journal_day_${day}`;

const makeDayState = (routineLen: number, spotLen: number): DayState => ({
  videoWatched: false,
  routineTasks: Array(routineLen).fill(false),
  spotTasks: Array(spotLen).fill(false),
  journal: '',
  celebrated: false,
});

// Progress (non-sensitive: task booleans, video watched, celebrated) → AsyncStorage
const saveProgress = async (progress: Record<number, DayState>) => {
  // Strip out journal text before storing in AsyncStorage
  const stripped: Record<number, Omit<DayState, 'journal'>> = {};
  for (const [k, v] of Object.entries(progress)) {
    const { journal: _j, ...rest } = v;
    stripped[Number(k)] = rest;
  }
  await AsyncStorage.setItem('journey_progress', JSON.stringify(stripped));
};

// Journal entries (sensitive) → SecureStore
const saveJournalSecure = async (day: number, text: string) => {
  try {
    await SecureStore.setItemAsync(JOURNAL_KEY(day), text);
  } catch {
    // SecureStore has 2048 byte limit per key on some platforms; fall back to AsyncStorage
    await AsyncStorage.setItem(JOURNAL_KEY(day), text);
  }
};

const loadJournalSecure = async (day: number): Promise<string> => {
  try {
    const val = await SecureStore.getItemAsync(JOURNAL_KEY(day));
    if (val !== null) return val;
    // Try AsyncStorage fallback
    return (await AsyncStorage.getItem(JOURNAL_KEY(day))) ?? '';
  } catch {
    return (await AsyncStorage.getItem(JOURNAL_KEY(day))) ?? '';
  }
};

export const useJourneyStore = create<JourneyStore>((set, get) => ({
  progress: {},
  currentDay: 1,
  hardStopActive: false,

  initDay: (day, routineLen, spotLen) => {
    const { progress } = get();
    if (!progress[day]) {
      set((s) => ({
        progress: { ...s.progress, [day]: makeDayState(routineLen, spotLen) },
      }));
      // Load journal from SecureStore asynchronously
      loadJournalSecure(day).then((journal) => {
        set((s) => {
          const existing = s.progress[day];
          if (!existing) return s;
          return { progress: { ...s.progress, [day]: { ...existing, journal } } };
        });
      });
    }
  },

  toggleRoutineTask: async (day, index) => {
    set((s) => {
      const dayState = s.progress[day];
      if (!dayState) return s;
      const routineTasks = [...dayState.routineTasks];
      routineTasks[index] = !routineTasks[index];
      const updated = { ...s.progress, [day]: { ...dayState, routineTasks } };
      saveProgress(updated);
      return { progress: updated };
    });
  },

  toggleSpotTask: async (day, index) => {
    set((s) => {
      const dayState = s.progress[day];
      if (!dayState) return s;
      const spotTasks = [...dayState.spotTasks];
      spotTasks[index] = !spotTasks[index];
      const updated = { ...s.progress, [day]: { ...dayState, spotTasks } };
      saveProgress(updated);
      return { progress: updated };
    });
  },

  markVideoWatched: async (day) => {
    set((s) => {
      const dayState = s.progress[day];
      if (!dayState) return s;
      const updated = { ...s.progress, [day]: { ...dayState, videoWatched: true } };
      saveProgress(updated);
      return { progress: updated };
    });
  },

  setJournal: (day, text) => {
    set((s) => {
      const dayState = s.progress[day];
      if (!dayState) return s;
      return { progress: { ...s.progress, [day]: { ...dayState, journal: text } } };
    });
  },

  saveJournal: async (day) => {
    const { progress } = get();
    const dayState = progress[day];
    if (dayState) {
      await saveJournalSecure(day, dayState.journal);
    }
  },

  markCelebrated: async (day) => {
    set((s) => {
      const dayState = s.progress[day];
      if (!dayState) return s;
      const updated = { ...s.progress, [day]: { ...dayState, celebrated: true } };
      saveProgress(updated);
      return { progress: updated };
    });
    // Sync completion to backend (best-effort, don't block UI)
    try {
      const { progress } = get();
      const dayState = progress[day];
      if (dayState) {
        await api.progress.upsertDay(day, {
          video_watched: dayState.videoWatched,
          tasks_complete: {
            routine: dayState.routineTasks,
            spot: dayState.spotTasks,
          },
          celebrated: true,
        });
      }
    } catch {
      // Offline-first — local state is source of truth
    }
  },

  toggleHardStop: async () => {
    set((s) => {
      const next = !s.hardStopActive;
      AsyncStorage.setItem('hard_stop_active', JSON.stringify(next));
      return { hardStopActive: next };
    });
  },

  loadFromStorage: async () => {
    const raw = await AsyncStorage.getItem('journey_progress');
    if (raw) {
      const stripped = JSON.parse(raw) as Record<number, Omit<DayState, 'journal'>>;
      // Reconstruct with empty journals; initDay will hydrate them on demand
      const progress: Record<number, DayState> = {};
      for (const [k, v] of Object.entries(stripped)) {
        progress[Number(k)] = { ...v, journal: '' };
      }
      set({ progress });
    }
    const hs = await AsyncStorage.getItem('hard_stop_active');
    if (hs) set({ hardStopActive: JSON.parse(hs) });
  },

  isDayComplete: (day) => {
    const { progress } = get();
    const s = progress[day];
    if (!s) return false;
    return (
      s.videoWatched &&
      s.routineTasks.every(Boolean) &&
      s.spotTasks.every(Boolean)
    );
  },

  isDayUnlocked: (day) => {
    if (day === 1) return true;
    const { isDayComplete } = get();
    return isDayComplete(day - 1);
  },
}));
