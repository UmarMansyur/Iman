import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Unaauthorized() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Image src="/401.svg" alt="401" width={400} height={400} />
      <h1 className="text-6xl font-bold">401</h1>
      <p className="text-xl">Unauthorized</p>
      <p className="text-lg">You are not authorized to access this page</p>
      <Link href="/">
        <Button className="mt-4" variant="outline">
          <Home />
          Go to Home
        </Button>
      </Link>
    </div>
  );
}
