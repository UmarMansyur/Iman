"use client"

import * as React from "react"
import { Building, Building2, Check, ChevronsUpDown, Plus } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import Link from "next/link";
import { useUserStore } from "@/store/user-store";
import { Factory } from "@/lib/definitions";

export function TeamSwitcher() {
  const { isMobile } = useSidebar()
  const { user, setActiveFactory } = useUserStore();
  const setActiveTeam = (team: Factory) => {
    setActiveFactory(team);
  }
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              variant="none"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                {
                  user?.factory_selected?.logo ? <img src={user?.factory_selected?.logo} alt={user?.factory_selected?.name} className="size-4" /> : <Building className="size-4" />
                }
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {user?.factory_selected?.name}
                </span>
                <span className="truncate text-xs">{user?.factory_selected?.status}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Pabrikku
            </DropdownMenuLabel>
            {user?.factory.map((team, index) => (
              <Link href={`${team.position.includes('Owner') ? '/owner' : '/'}`} key={team.name}>
                <DropdownMenuItem
                  key={team.name}
                onClick={() => setActiveTeam(team)}
                className={`gap-2 p-2 ${team.id == user?.factory_selected?.id ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''}`}
              >
                <div className="flex size-6 items-center justify-center rounded-sm border">
                {
                  team.logo ? <img src={team.logo} alt={team.name} className="size-4 shrink-0" /> : <Building className="size-4 shrink-0" />
                }
                </div>
                {team.name}
                <DropdownMenuShortcut>
                 {/* jika sama dengan factory_selected maka tampilkan shorcut lucide-react:check */}
                 {
                  team.id == user?.factory_selected?.id ? <Check className="size-4 shrink-0" /> : null
                 }
                </DropdownMenuShortcut>
              </DropdownMenuItem>
              </Link>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                <Plus className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">
                Tambah Pabrik
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}