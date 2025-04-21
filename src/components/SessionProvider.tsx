'use client'
import { useContext, useEffect, useState } from "react";
import { SessionContext } from "@/lib/context";
import { SessionPayload } from "@/lib/definitions";
import { getClientSession } from "@/lib/sessionClient";
import { useUserStore } from "@/store/user-store";
import { redirect } from "next/navigation";


export default function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<SessionPayload | null>(null);
  const { setUser: setUserStore, user: userStore } = useUserStore();
  useEffect(() => {
    if(userStore) return;
    const getUser = async () => {
      const user = await getClientSession();
      if(!user) {
        redirect("/login");
        return;
      };
      setUserStore(user);
      setUser(user);
    }
    getUser();
  }, [userStore, user, setUserStore]);
  return <SessionContext.Provider value={{user, setUser}}>{children}</SessionContext.Provider>;
}

export function useSession() {
  return useContext(SessionContext);
}
