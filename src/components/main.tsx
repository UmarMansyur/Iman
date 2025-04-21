'use client'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import Provider from "./SessionProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserStore } from "@/store/user-store";
import { ChevronDown, LogOut, User2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Image from "next/image";
import { Public_Sans } from "next/font/google";
import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { logout } from "@/app/actions/auth";

const publicSans = Public_Sans({
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  style: "normal",
  subsets: ["latin"],
})

export default function MainPage({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = useUserStore();
  const [isClick, setIsClick] = useState(false);

  const { setUser } = useUserStore()

  const handleLogout = async () => {
    setUser(null);
    await logout();
  };

  return (
    <Provider>
      <SidebarProvider style={publicSans.style}>
        <header className="flex w-full bg-transparent backdrop-blur top-0 fixed h-16 shrink-0 items-center gap-2 px-4 z-10 border">
          <SidebarTrigger className={`size-8 border ${isClick ? "sm:ms-10" : "sm:ms-[15.5rem]"}`} onClick={() => setIsClick(!isClick)} />
          <div className="ms-auto flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger className="focus:outline-none">
                <div className="flex items-center justify-start gap-2">
                  <Avatar className="size-8">
                    <AvatarImage src={session.user?.thumbnail || "https://ik.imagekit.io/8zmr0xxik/blob_c2rRi4vdU?updatedAt=1709077347010"} alt="@shadcn" />
                    <AvatarFallback>{session.user?.username.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="text-start">
                    <h1 className="text-[13px] text-gray-900">{session.user?.username}</h1>
                  </div>
                  <ChevronDown className="ml-auto size-3" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 me-2 shadow-none border bg-white/70 backdrop-blur-xl ">
                <div className="flex flex-col gap-2 py-3 px-2">
                  <h1 className="text-[13px] text-muted-foreground">Selamat datang {session?.user?.username}</h1>
                  <div className="flex gap-2 items-center">
                    <div className="flex w-12 h-12 items-center justify-center border p-1 overflow-hidden rounded-lg">
                      <Image src={session.user?.thumbnail || "https://ik.imagekit.io/8zmr0xxik/blob_c2rRi4vdU?updatedAt=1709077347010"} alt="@shadcn" width={100} height={100} className="rounded-lg" style={{ width: 'auto', height: 'auto' }} />
                    </div>
                    <div>
                      <h1 className="text-[14px] h-4 text-gray-900">{session.user?.username}</h1>
                      <span className="text-[13px] text-gray-600">{session.user?.factory_selected?.position}</span>
                    </div>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-start hover:bg-gray-100 flex items-center justify-start gap-2 text-gray-600 p-3" onClick={handleLogout}>
                  <User2 className="w-4 h-4" />
                  Profil
                </DropdownMenuLabel>

                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-center hover:bg-gray-100 flex items-center justify-center gap-2 text-sm p-3" onClick={handleLogout}>
                  <LogOut className="w-4 h-4" />
                  Logout
                </DropdownMenuLabel>
              </DropdownMenuContent>
            </DropdownMenu>

          </div>
        </header>
        <AppSidebar className="border-r border" />
        <SidebarInset style={publicSans.style}>
          <div className="flex flex-1 flex-col gap-4 px-4 w-full pt-20 text-sm">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </Provider>
  );
}
