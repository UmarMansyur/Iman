import { create } from 'zustand';
import { SortingState } from '@tanstack/react-table';

interface TableStore {
  // State untuk menyimpan pengaturan sorting di tabel
  sorting: SortingState;
  // State untuk menyimpan kolom yang sedang aktif
  activeSortColumn: string | null;
  // State untuk boolean status delete
  isDelete: boolean;
  // Actions
  setSorting: (sorting: SortingState) => void;
  setActiveSortColumn: (columnId: string | null) => void;
  resetSorting: () => void;
  setIsDelete: (isDelete: boolean) => void;
}

export const useTableStore = create<TableStore>((set) => ({
  sorting: [],
  activeSortColumn: null,
  isDelete: false,
  setSorting: (sorting) => set({ sorting }),
  setActiveSortColumn: (columnId) => set({ activeSortColumn: columnId }),
  resetSorting: () => set({ sorting: [], activeSortColumn: null }),
  setIsDelete: (isDelete) => set({ isDelete }),
})); 