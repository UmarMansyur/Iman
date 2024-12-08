import { create } from 'zustand';
import { SortingState } from '@tanstack/react-table';

interface TableStore {
  // State untuk menyimpan pengaturan sorting di tabel
  sorting: SortingState;
  // State untuk menyimpan kolom yang sedang aktif
  activeSortColumn: string | null;
  
  // Actions
  setSorting: (sorting: SortingState) => void;
  setActiveSortColumn: (columnId: string | null) => void;
  resetSorting: () => void;
}

export const useTableStore = create<TableStore>((set) => ({
  sorting: [],
  activeSortColumn: null,
  
  setSorting: (sorting) => set({ sorting }),
  setActiveSortColumn: (columnId) => set({ activeSortColumn: columnId }),
  resetSorting: () => set({ sorting: [], activeSortColumn: null }),
})); 