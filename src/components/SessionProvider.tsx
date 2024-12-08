'use client'
import { useContext, useEffect, useState } from "react";
import { SessionContext } from "@/lib/context";
import { SessionPayload } from "@/lib/definitions";
import { getClientSession } from "@/lib/sessionClient";


export default function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<SessionPayload | null>(null);
  useEffect(() => {
    const getUser = async () => {
      const user = await getClientSession();
      setUser(user);
    }
    getUser();
  }, []);
  return <SessionContext.Provider value={{user, setUser}}>{children}</SessionContext.Provider>;
}

export function useSession() {
  return useContext(SessionContext);
}
