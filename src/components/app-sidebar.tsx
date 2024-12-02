"use client"

import * as React from "react"
import {
  Building2,
  Combine,
  Database,
  FileChartLine,
  Home,
  List,
  PackageSearch,
  ScrollText,
  Settings,
  Truck,
  Users,
} from "lucide-react"

import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import { NavMain } from "@/components/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"


// This is sample data.
const data = {
  user: {
    name: "Umar Mansyur",
    email: "umar@unira.ac.id",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "PT. Segara Catur Perkasa",
      logo: Building2,
      plan: "Aktif",
    },
  ],
  navAdmin: [
    {
      title: "Dashboard",
      url: "#",
      icon: Home,
      isActive: true,
    },
    {
      title: "Data Master",
      url: "#",
      icon: Database,
      items: [
        {
          title: "Pengguna",
          url: "#",
        },
        {
          title: "Pabrik",
          url: "#",
        },
        {
          title: "Hak Akses",
          url: "#",
        },
      ],
    },
    {
      title: "Data Pembelian",
      url: "#",
      icon: ScrollText,
    },
    {
      title: "Data Penjualan",
      url: "#",
      icon: FileChartLine,
    },
    {
      title: "Pengaturan",
      url: "#",
      icon: Settings,
      items: [
        {
          title: "Hak Akses",
          url: "#",
        },
        {
          title: "Metode Pembayaran",
          url: "#",
        }
      ],
    },

  ],
  navOwner: [
    {
      title: "Dashboard",
      url: "#",
      icon: Home,
      isActive: true,
    },
    {
      title: "Data Produk",
      url: "#",
      icon: PackageSearch,
    },
    {
      title: "Bahan Baku",
      url: "#",
      icon: Combine,
    },
    {
      title: "Manajemen Operator",
      url: "#",
      icon: Users,
    },
    {
      title: "Laporan Produksi",
      url: "#",
      icon: FileChartLine,
    },
    {
      title: "Data Pembelian",
      url: "#",
      icon: ScrollText,
    },
    {
      title: "Data Penjualan",
      url: "#",
      icon: FileChartLine,
    },
    

  ],
  navOperator: [
    {
      title: "Dashboard",
      url: "#",
      icon: Home,
      isActive: true,
    },
    {
      title: "Produksi",
      url: "#",
      icon: PackageSearch,
    },
    {
      title: "Manajemen Bahan Baku",
      url: "#",
      icon: Combine,
    },
    {
      title: "Data Pesanan",
      url: "#",
      icon: List,
    },
    {
      title: "Faktur dan Pengiriman",
      url: "#",
      icon: Truck,
    },
    {
      title: "Report Penjualan",
      url: "#",
      icon: FileChartLine,
    },
    

  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props} >
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain title="Administrator" items={data.navAdmin} />
        <NavMain title="Owner" items={data.navOwner} />
        <NavMain title="Operator" items={data.navOperator} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
