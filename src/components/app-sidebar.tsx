"use client";

import * as React from "react";
import {
  Blocks,
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
  Users,
} from "lucide-react";
import { TeamSwitcher } from "@/components/team-switcher";
import { NavMain } from "@/components/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { useUserStore } from "@/store/user-store";
import Image from "next/image";

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
    // {
    //   title: "Transaksi Produk",
    //   url: "/operator/transaksi",
    //   icon: ShoppingBagIcon,
    //   items: [
    //     {
    //       title: "Daftar Transaksi",
    //       url: "/operator/transaksi",
    //     },
    //     {
    //       title: "Pengiriman",
    //       url: "/operator/transaksi/pengiriman",
    //     },
    //   ],
    // },
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
      title: "Bahan Baku",
      url: "/distributor/bahan-baku",
      icon: Combine,
      items: [
        {
          title: "Daftar Bahan Baku",
          url: "/distributor/bahan-baku",
        },
        {
          title: "Order Bahan Baku",
          url: "/distributor/order-bahan-baku",
        },
      ]
    },
    {
      title: "Data Produk",
      url: "/distributor/data-produk",
      icon: PackageSearch,
      items: [
        {
          title: "Produk Pabrik",
          url: "/distributor/data-produk",
        },
        {
          title: "Produk Non Pabrik",
          url: "/distributor/data-produk-non-pabrik",
        },
      ],
    },
    {
      title: "Data Order",
      url: "/distributor/data-order",
      icon: SendToBack,
      items: [
        {
          title: "Tambah Order",
          url: "/distributor/pre-order",
        },
        {
          title: "Daftar Order",
          url: "/distributor/data-order",
        },
        {
          title: "Upload Bukti Pembayaran",
          url: "/distributor/upload-bukti-pembayaran",
        },
        {
          title: "Konfirmasi Penerimaan Order",
          url: "/distributor/konfirmasi-penerimaan",
        },
        {
          title: "Pelunasan",
          url: "/distributor/pelunasan",
        },
      ],
    },
    {
      title: "Transaksi Produk",
      url: "/distributor/transaksi",
      icon: ShoppingBagIcon,
      items: [
        {
          title: "Daftar Transaksi",
          url: "/distributor/transaksi",
        },
        {
          title: "Pengiriman & Pembayaran",
          url: "/distributor/pengiriman-pembayaran",
        },
      ],
    },
  ],
  navOwnerDistributor: [
    {
      title: "Dashboard",
      url: "/owner-distributor",
      icon: Home,
    },
    {
      title: "Data Produk",
      url: "/owner-distributor/data-produk",
      icon: PackageSearch,
    },
    {
      title: "Data Order",
      url: "/owner-distributor/data-order",
      icon: SendToBack,
    },
    {
      title: "Laporan Transaksi Produk",
      url: "/owner-distributor/laporan-transaksi",
      icon: FileText,
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
    if (pathname?.startsWith("/owner") && !pathname?.startsWith("/owner-distributor")) {
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
    if (pathname?.startsWith("/owner-distributor")) {
      return <NavMain title="Owner Distributor" items={addActiveState(data.navOwnerDistributor)} />;
    }
    return null;
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="h-16 flex items-center justify-between px-4 bg-white/10 backdrop-blur">
        {user?.factory_selected &&
          !user?.factory_selected.position.includes("Distributor") &&
          !user?.factory_selected.position.includes("Owner Distributor") && <TeamSwitcher />
        }
        {
          user?.factory_selected &&
          (user?.factory_selected.position.includes("Distributor") ||
          user?.factory_selected.position.includes("Owner Distributor") ||
          user?.factory_selected.position.includes("Administrator")) && <div className="flex h-16">
            <Image src="/logo.svg" alt="logo" width={90} height={90} />
          </div>
        }
      </SidebarHeader>
      <SidebarContent className="bg-white/10 backdrop-blur">{getNavItems()}</SidebarContent>
    </Sidebar>
  );
}
