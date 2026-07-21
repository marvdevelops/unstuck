import AsyncStorage from '@react-native-async-storage/async-storage';
import { useJourneyStore } from '../store/useJourneyStore';
import { useToolStore } from '../store/useToolStore';
import { useUserStore } from '../store/useUserStore';
import { CURRICULUM } from '../constants/curriculum';
import { api, CycleSnapshot } from './api';
import { clearAllJournals } from './resetLocalData';

export function buildCycleSnapshot(): CycleSnapshot {
  const { progress } = useJourneyStore.getState();
  const { victoryLog, stealersLog } = useToolStore.getState();
  const { coreValues } = useUserStore.getState();

  const days = CURRICULUM.map((d) => {
    const s = progress[d.day];
    return {
      day: d.day,
      title: d.title,
      videoWatched: s?.videoWatched ?? false,
      routineDone: s?.routineTasks.filter(Boolean).length ?? 0,
      routineTotal: d.routine.length,
      spotDone: s?.spotTasks.filter(Boolean).length ?? 0,
      spotTotal: d.spot.length,
      journal: s?.journal ?? '',
      celebrated: s?.celebrated ?? false,
    };
  });

  return { days, coreValues, victoryLog, stealersLog };
}

// Snapshots the current cycle to the backend. Returns false on failure
// (offline, server error) so the caller can abort the reset rather than
// silently discarding data the user asked to keep.
export async function archiveCurrentCycle(): Promise<boolean> {
  const snapshot = buildCycleSnapshot();
  const daysCompleted = snapshot.days.filter((d) => d.celebrated).length;
  try {
    await api.archives.create(snapshot, daysCompleted);
    return true;
  } catch {
    return false;
  }
}

// Resets the journey to Day 1 for a new 21-day cycle. Deliberately narrower
// than resetLocalUserData() (logout) — never touches onboarding, auth
// tokens, or the trial clock, only journey-cycle data.
export async function resetJourneyForNewCycle(): Promise<void> {
  await AsyncStorage.multiRemove([
    'journey_progress',
    'hard_stop_active',
    'core_values',
    'stealers_log',
    'victory_log',
  ]);
  await clearAllJournals();

  useJourneyStore.setState({ progress: {}, currentDay: 1, hardStopActive: false });
  useToolStore.setState({ stealersLog: {}, victoryLog: [] });
  useUserStore.setState({ coreValues: [] });

  try {
    await api.progress.resetAll();
    await api.auth.saveCoreValues([]);
  } catch {
    // Offline — local reset already applied. Will resync once the device
    // is back online and loadFromStorage() runs again.
  }
}
