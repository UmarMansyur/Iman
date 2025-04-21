'use client'
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/store/user-store";
import { Home } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Unaauthorized() {
  const router = useRouter();
  const { user } = useUserStore();

  const gotoHome = () => {
    if(!user){
      // clear sessiono
      fetch("/api/auth/login", {
        method: "DELETE",
      }).then(() => {
        router.replace("/login");
      });
      return;
    }

    if(user.factory_selected?.position.includes("Owner")) {
      router.replace("/owner");
      return;
    }

    if(user.factory_selected?.position.includes("Distributor")) {
      router.replace("/distributor");
      return;
    }

    if(user.factory_selected?.position.includes("Operator")) {
      router.replace("/operator");
      return;
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Image src="/401.svg" alt="401" width={400} height={400} />
      <h1 className="text-6xl font-bold">401</h1>
      <p className="text-xl">Unauthorized</p>
      <p className="text-lg">You are not authorized to access this page</p>
      <Button type="button" className="mt-4 flex items-center gap-2" variant="ghost" onClick={gotoHome}>
        <Home />
        Go to Home
      </Button>
    </div>
  );
}
