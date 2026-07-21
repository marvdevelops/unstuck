import { create } from 'zustand';
import { api, ArchiveRecord } from '../lib/api';

interface ArchiveStore {
  archives: ArchiveRecord[];
  loading: boolean;
  fetchArchives: () => Promise<void>;
  getArchive: (id: string) => ArchiveRecord | undefined;
}

export const useArchiveStore = create<ArchiveStore>((set, get) => ({
  archives: [],
  loading: false,

  fetchArchives: async () => {
    set({ loading: true });
    try {
      const archives = await api.archives.list();
      set({ archives, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  getArchive: (id) => get().archives.find((a) => a.id === id),
}));
