import { SessionPayload } from "@/lib/definitions";
import { create } from "zustand";

interface UserStore {
  user: SessionPayload | null;
  setUser: (user: SessionPayload | null) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user })
}));
