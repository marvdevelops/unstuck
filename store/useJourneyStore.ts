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

// Progress (non-sensitive) → AsyncStorage
const saveProgress = async (progress: Record<number, DayState>) => {
  const stripped: Record<number, Omit<DayState, 'journal'>> = {};
  for (const [k, v] of Object.entries(progress)) {
    const { journal: _j, ...rest } = v;
    stripped[Number(k)] = rest;
  }
  await AsyncStorage.setItem('journey_progress', JSON.stringify(stripped));
};

// Journal entries → SecureStore with AsyncStorage fallback
const saveJournalLocal = async (day: number, text: string) => {
  try {
    await SecureStore.setItemAsync(JOURNAL_KEY(day), text);
  } catch {
    await AsyncStorage.setItem(JOURNAL_KEY(day), text);
  }
};

const loadJournalLocal = async (day: number): Promise<string> => {
  try {
    const val = await SecureStore.getItemAsync(JOURNAL_KEY(day));
    if (val !== null) return val;
    return (await AsyncStorage.getItem(JOURNAL_KEY(day))) ?? '';
  } catch {
    return (await AsyncStorage.getItem(JOURNAL_KEY(day))) ?? '';
  }
};

// Fire-and-forget API sync — never blocks UI
const syncDay = (day: number, state: DayState) => {
  api.progress.upsertDay(day, {
    video_watched: state.videoWatched,
    tasks_complete: { routine: state.routineTasks, spot: state.spotTasks },
    journal: state.journal,
    celebrated: state.celebrated,
  }).catch(() => {});
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
      // Journal may not be loaded yet if loadFromStorage ran before this day was seen
      loadJournalLocal(day).then((journal) => {
        set((s) => {
          const existing = s.progress[day];
          if (!existing || existing.journal) return s; // already populated by API load
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
      syncDay(day, updated[day]);
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
      syncDay(day, updated[day]);
      return { progress: updated };
    });
  },

  markVideoWatched: async (day) => {
    set((s) => {
      const dayState = s.progress[day];
      if (!dayState) return s;
      const updated = { ...s.progress, [day]: { ...dayState, videoWatched: true } };
      saveProgress(updated);
      syncDay(day, updated[day]);
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
    if (!dayState) return;
    await saveJournalLocal(day, dayState.journal);
    syncDay(day, dayState);
  },

  markCelebrated: async (day) => {
    set((s) => {
      const dayState = s.progress[day];
      if (!dayState) return s;
      const updated = { ...s.progress, [day]: { ...dayState, celebrated: true } };
      saveProgress(updated);
      return { progress: updated };
    });
    const { progress } = get();
    const dayState = progress[day];
    if (dayState) syncDay(day, { ...dayState, celebrated: true });
  },

  toggleHardStop: async () => {
    set((s) => {
      const next = !s.hardStopActive;
      AsyncStorage.setItem('hard_stop_active', JSON.stringify(next));
      return { hardStopActive: next };
    });
  },

  loadFromStorage: async () => {
    // Local cache first for instant startup
    const raw = await AsyncStorage.getItem('journey_progress');
    if (raw) {
      const stripped = JSON.parse(raw) as Record<number, Omit<DayState, 'journal'>>;
      const progress: Record<number, DayState> = {};
      for (const [k, v] of Object.entries(stripped)) {
        progress[Number(k)] = { ...v, journal: '' };
      }
      set({ progress });
    }
    const hs = await AsyncStorage.getItem('hard_stop_active');
    if (hs) set({ hardStopActive: JSON.parse(hs) });

    // Fetch from API — authoritative source, includes journals
    try {
      const rows = await api.progress.getAll();
      if (!rows?.length) return;
      set((s) => {
        const merged = { ...s.progress };
        for (const row of rows) {
          const day = row.dayNumber as number;
          const tc = (row.tasksComplete as any) ?? {};
          const existing = merged[day];
          merged[day] = {
            videoWatched: row.videoWatched ?? existing?.videoWatched ?? false,
            routineTasks: tc.routine ?? existing?.routineTasks ?? [],
            spotTasks: tc.spot ?? existing?.spotTasks ?? [],
            journal: row.journal ?? existing?.journal ?? '',
            celebrated: row.celebrated ?? existing?.celebrated ?? false,
          };
          // Keep local journal cache in sync
          if (row.journal) saveJournalLocal(day, row.journal);
        }
        return { progress: merged };
      });
      // Update AsyncStorage cache from API data
      const updatedProgress = get().progress;
      saveProgress(updatedProgress);
    } catch {
      // Offline or not logged in — local state stays
    }
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
