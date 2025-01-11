import { Factory, SessionPayload } from "@/lib/definitions";
import { create } from "zustand";

interface UserStore {
  user: SessionPayload | null;
  setUser: (user: SessionPayload | null) => void;
  setActiveFactory: (factory: Factory | null) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  setActiveFactory: (factory) =>
    set((state) => {
      if (!state.user) return { user: null };
      return {
        user: {
          ...state.user,
          factory_selected: factory,
        },
      };
    }),
}));
