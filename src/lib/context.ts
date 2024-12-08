import { createContext } from "react";
import { SessionPayload } from "./definitions";


export const SessionContext = createContext<{user: SessionPayload | null, setUser: (user: SessionPayload | null) => void} | null>(null);