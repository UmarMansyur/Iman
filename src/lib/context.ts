import { createContext } from "react";
import { SessionPayload } from "./definitions";

export type SortOrder = "asc" | "desc" | "clear";

export const SortContext = createContext<{sortBy: string, sortOrder: SortOrder, setSort: (sortBy: string, sortOrder: SortOrder) => void} | null>(null);

export const SessionContext = createContext<{user: SessionPayload | null, setUser: (user: SessionPayload | null) => void} | null>(null);