import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@radix-ui/react-separator";

export default function MainPage({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex fixed w-full top-0 bg-white h-16 shrink-0 items-center gap-2  px-4 z-10">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />

        </header>
        <div className="flex flex-1 flex-col gap-4 px-4 w-full bg-[#F5F6FA] pt-20">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}