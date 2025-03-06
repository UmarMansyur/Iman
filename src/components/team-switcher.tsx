"use client";

import * as React from "react";
import { Building, Check, ChevronsUpDown } from "lucide-react";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { useUserStore } from "@/store/user-store";
import { Factory } from "@/lib/definitions";

export function TeamSwitcher() {
  const { isMobile } = useSidebar();
  const { user, setActiveFactory } = useUserStore();
  const setActiveTeam = (team: Factory) => {
    setActiveFactory(team);
  };
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              variant="none"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground ">
                {user?.factory_selected?.logo ? (
                  <Image
                    src={user?.factory_selected?.logo}
                    alt={user?.factory_selected?.name}
                    className="size-4"
                    width={24}
                    height={24}
                  />
                ) : (
                  <Building className="size-4" />
                )}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {user?.factory_selected?.name}
                </span>
                <span className="truncate text-xs">
                  {user?.factory_selected?.status === "Active"
                    ? "Aktif"
                    : "Tidak Aktif"}
                </span>
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
            {user?.factory.map((team) => (
              <Link
                href={`/${team.position.toString().toLowerCase()}`}
                key={team.name}
                className={
                  team.status_member !== "Active" || team.status !== "Active"
                    ? "pointer-events-none"
                    : ""
                }
              >
                <DropdownMenuItem
                  key={team.name}
                  onClick={() => setActiveTeam(team)}
                  disabled={team.status_member !== "Active"}
                  className={`gap-2 p-2 ${
                    team.id == user?.factory_selected?.id
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : ""
                  } ${
                    team.status !== "Active"
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  <div className="flex size-6 items-center justify-center rounded-sm border">
                    {team.logo ? (
                      <Image
                        src={team.logo}
                        alt={team.name}
                        className="shrink-0"
                        width={24}
                        height={24}
                      />
                    ) : (
                      <Building className="size-4 shrink-0" />
                    )}
                  </div>
                  {team.name}
                  <DropdownMenuShortcut>
                    {team.id == user?.factory_selected?.id ? (
                      <Check className="size-4 shrink-0" />
                    ) : null}
                  </DropdownMenuShortcut>
                </DropdownMenuItem>
              </Link>
            ))}
            <DropdownMenuSeparator />
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
