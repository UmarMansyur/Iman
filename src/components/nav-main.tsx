"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavMain({
  title,
  items,
}: {
  title: string;
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarMenu className="text-[15px] text-gray-700">
        <SidebarGroupLabel>{title}</SidebarGroupLabel>
        {items.map((item) =>
          item.items ? (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={
                item.isActive ||
                item.items.some((subItem) => pathname === subItem.url)
              }
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    variant="default"
                    tooltip={item.title}
                    data-active={item.isActive}
                    className={`py-5 transition-colors ${
                      item.isActive
                        ? "bg-blue-300 text-white"
                        : "hover:text-white hover:bg-blue-500"
                    }`}
                  >
                    {item.icon && <item.icon />}
                    <span className="ps-2">{item.title}</span>
                    {item.items && (
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    )}
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                {item.items && (
                  <CollapsibleContent>
                    <SidebarMenuSub className="group-data-[state=open]/collapsible:block">
                      {item.items.map((subItem) => (
                        <SidebarMenuSubItem
                          key={subItem.title}
                          className="ps-2"
                        >
                          <SidebarMenuSubButton
                            asChild
                            className={`py-5 hover:font-semibold hover:text-blue-500 hover:bg-transparent focus:font-semibold focus:text-blue-500 focus:bg-transparent active:bg-transparent active:text-blue-500 ${
                              pathname === subItem.url
                                ? "font-semibold text-blue-500"
                                : ""
                            }`}
                          >
                            <Link href={subItem.url}>
                              <span className="ps-2">{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                )}
              </SidebarMenuItem>
            </Collapsible>
          ) : (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                className={`transition-colors py-5 ${
                  pathname === item.url
                    ? "bg-blue-500 text-white"
                    : "hover:text-white hover:bg-blue-500"
                }`}
              >
                <Link href={item.url}>
                  {item.icon && <item.icon />}
                  <span className="ps-2">{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
