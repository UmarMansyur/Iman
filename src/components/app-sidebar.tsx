"use client";

import * as React from "react";
import {
  Blocks,
  CheckCheckIcon,
  Combine,
  Database,
  FileText,
  Home,
  PackageSearch,
  PercentCircle,
  PercentDiamond,
  SendToBack,
  Settings,
  ShoppingBagIcon,
  SquareKanban,
  SquarePercent,
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
          title: "Distributor",
          url: "/admin/distributor",
        },
        {
          title: "Satuan",
          url: "/admin/satuan",
        },
        {
          title: "Hak Akses",
          url: "/admin/hak-akses",
        },
      ],
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
      url: "#",
      icon: PackageSearch,
      items: [
        {
          title: "Daftar Produk",
          url: "/owner/produk",
        },
        {
          title: "Stok Produk",
          url: "/owner/stok-produk",
        },
      ],
    },
    {
      title: "Laporan Produksi Produk",
      url: "/owner/laporan-produksi",
      icon: FileText,
    },
    {
      title: "Laporan Transaksi Produk",
      url: "/owner/laporan-transaksi",
      icon: PercentDiamond,
    },
    {
      title: "Laporan Transaksi Jasa",
      url: "/owner/laporan-transaksi-jasa",
      icon: PercentCircle,
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
      url: "/operator",
      icon: Home,
    },
    {
      title: "Bahan Baku",
      url: "#",
      icon: Combine,
      items: [
        {
          title: "Daftar Bahan Baku",
          url: "/operator/bahan-baku",
        },
        {
          title: "Persediaan Bahan Baku",
          url: "/operator/persediaan-bahan-baku",
        },
        {
          title: "Bahan Baku Produksi",
          url: "/operator/bahan-baku-produksi",
        },
      ],
    },
    {
      title: "Data Produk",
      url: "#",
      icon: SquareKanban,
      items: [
        {
          title: "Daftar Produk",
          url: "/operator/produk",
        },
        {
          title: "Stok Produk",
          url: "/operator/stok-produk",
        },
        {
          title: "Input Produksi Harian",
          url: "/operator/laporan-produksi",
        },
      ],
    },
    {
      title: "Data Pre Order",
      url: "/operator/data-pre-order",
      icon: SendToBack,
      items: [
        {
          title: "Konfirmasi Pembayaran",
          url: "/operator/konfirmasi-pembayaran",
        },
        {
          title: "Pengiriman",
          url: "/operator/pengiriman",
        },
        {
          title: "Pelunasan",
          url: "/operator/pelunasan",
        },
        {
          title: "Laporan Order",
          url: "/operator/laporan-order",
        },
      ],
    },
    {
      title: "Transaksi Produk",
      url: "/operator/transaksi",
      icon: ShoppingBagIcon,
      items: [
        {
          title: "Daftar Transaksi",
          url: "/operator/transaksi",
        },
        {
          title: "Pengiriman",
          url: "/operator/transaksi/pengiriman",
        },
      ],
    },
    {
      title: "Data Layanan Jasa",
      url: "/operator/service",
      icon: SquarePercent,
    },
    {
      title: "Transaksi Jasa",
      url: "/operator/transaksi-jasa",
      icon: Blocks,
      items: [
        {
          title: "Daftar Transaksi Jasa",
          url: "/operator/transaksi-jasa",
        },
        {
          title: "Pelunasan",
          url: "/operator/transaksi-jasa/pelunasan",
        },
      ],
    },
  ],
  navDistributor: [
    {
      title: "Dashboard",
      url: "/distributor",
      icon: Home,
    },
    {
      title: "Data Produk",
      url: "/distributor/data-produk",
      icon: PackageSearch,
      items: [
        {
          title: "Data Produk",
          url: "/distributor/data-produk",
        },
        {
          title: "Data Stok",
          url: "/distributor/data-stok",
        },
      ],
    },
    {
      title: "Data Order",
      url: "/distributor/data-order",
      icon: SendToBack,
    },
    {
      title: "Konfirmasi Penerimaan Order",
      url: "/distributor/konfirmasi-penerimaan",
      icon: CheckCheckIcon,
    },
    {
      title: "Transaksi/Penjualan Produk",
      url: "/distributor/transaksi",
      icon: ShoppingBagIcon,
    },
    {
      title: "Pengiriman dan Pembayaran",
      url: "/distributor/pengiriman-pembayaran",
      icon: Truck,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
    if (pathname?.startsWith("/operator")) {
      return (
        <NavMain title="Operator" items={addActiveState(data.navOperator)} />
      );
    }
    if (pathname?.startsWith("/distributor")) {
      return (
        <NavMain
          title="Distributor"
          items={addActiveState(data.navDistributor)}
        />
      );
    }
    return null;
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {user?.factory_selected && <TeamSwitcher />}
      </SidebarHeader>
      <SidebarContent>{getNavItems()}</SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
