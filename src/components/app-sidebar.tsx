"use client";

import * as React from "react";
import {
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
} from "lucide-react";

import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import { NavMain } from "@/components/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { useUserStore } from "@/store/user-store";

// This is sample data.
const data = {
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
          url: "/admin/pabrik",
        },
        {
          title: "Satuan",
          url: "/admin/satuan",
        },
        {
          title: "Bahan Baku",
          url: "/admin/bahan-baku",
        },
        {
          title: "Satuan Bahan Baku",
          url: "/admin/satuan-bahan-baku",
        },
        {
          title: "Hak Akses",
          url: "/admin/hak-akses",
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
          title: "Metode Pembayaran",
          url: "/admin/setting/payment",
        },
        {
          title: "Pengaturan Akun",
          url: "/admin/setting/account",
        },
      ],
    },
  ],
  navOwner: [
    {
      title: "Dashboard",
      url: "/owner",
      icon: Home,
    },
    {
      title: "Bahan Baku",
      url: "/owner/bahan-baku",
      icon: Combine,
      items: [
        {
          title: "Persediaan Bahan Baku",
          url: "/owner/persediaan-bahan-baku",
        },
        {
          title: "Bahan Baku Produksi",
          url: "/owner/bahan-baku-produksi",
        },
      ],
    },
    {
      title: "Data Produk",
      url: "/owner/produk",
      icon: PackageSearch,
    },
    {
      title: "Data Pemesanan",
      url: "#",
      icon: ScrollText,
    },
    {
      title: "Data Penjualan",
      url: "#",
      icon: FileChartLine,
    },
    {
      title: "Manajemen Operator",
      url: "/owner/manajemen-operator",
      icon: Users,
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
};

export function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { user } = useUserStore();
  const addActiveState = (items: typeof data.navAdmin) => {
    return items.map((item) => ({
      ...item,
      isActive:
        item.url === pathname ||
        item.items?.some((subItem) => subItem.url === pathname),
      items: item.items,
    }));
  };

  const getNavItems = () => {
    if (pathname?.startsWith("/admin") && user?.typeUser === "Administrator") {
      return (
        <NavMain title="Administrator" items={addActiveState(data.navAdmin)} />
      );
    }
    if (pathname?.startsWith("/owner")) {
      return <NavMain title="Owner" items={addActiveState(data.navOwner)} />;
    }
    if (pathname?.startsWith("/")) {
      return (
        <NavMain title="Operator" items={addActiveState(data.navOperator)} />
      );
    }
    return null;
  };



  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher/>
      </SidebarHeader>
      <SidebarContent>{getNavItems()}</SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
