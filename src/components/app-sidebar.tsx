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
import { usePathname } from "next/navigation";

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
      url: "/admin/dashboard",
      icon: Home,
    },
    {
      title: "Data Master",
      url: "#",
      icon: Database,
      items: [
        {
          title: "Pengguna",
          url: "/admin/pengguna",
        },
        {
          title: "Pabrik",
          url: "#",
        },
        {
          title: "Satuan",
          url: "#",
        },
        {
          title: "Material",
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
        },
        {
          title: "PPN",
          url: "#",
        },
        {
          title: "Pengaturan Akun",
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
  // Add usePathname hook to get current route
  const pathname = usePathname()

  // Fungsi untuk menambahkan isActive ke items berdasarkan pathname
  const addActiveState = (items: typeof data.navAdmin) => {
    return items.map(item => ({
      ...item,
      isActive: item.url === pathname || 
                (item.items?.some(subItem => subItem.url === pathname)),
      items: item.items
    }))
  }

  // Modify getNavItems to use addActiveState
  const getNavItems = () => {
    if (pathname?.startsWith('/admin')) {
      return <NavMain title="Administrator" items={addActiveState(data.navAdmin)} />
    }
    if (pathname?.startsWith('/owner')) {
      return <NavMain title="Owner" items={addActiveState(data.navOwner)} />
    }
    if (pathname?.startsWith('/')) {
      return <NavMain title="Operator" items={addActiveState(data.navOperator)} />
    }
    return null
  }

  return (
    <Sidebar collapsible="icon" {...props} >
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        {getNavItems()}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}