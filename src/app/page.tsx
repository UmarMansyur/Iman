import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package2, ShoppingCart, Receipt, DollarSign } from "lucide-react";
import MainPage from "../components/main";
import SalesChart from "@/components/SalesChart";

export default function Layout() {
  const data = [
    { bulan: "Jan", penjualan: 150, produksi: 180 },
    { bulan: "Feb", penjualan: 200, produksi: 220 },
    { bulan: "Mar", penjualan: 180, produksi: 170 },
    { bulan: "Apr", penjualan: 250, produksi: 260 },
    { bulan: "Mei", penjualan: 280, produksi: 290 },
    { bulan: "Jun", penjualan: 300, produksi: 310 },
    { bulan: "Jul", penjualan: 320, produksi: 330 },
    { bulan: "Agu", penjualan: 340, produksi: 350 },
    { bulan: "Sep", penjualan: 360, produksi: 370 },
    { bulan: "Okt", penjualan: 380, produksi: 390 },
    { bulan: "Nov", penjualan: 400, produksi: 410 },
    { bulan: "Des", penjualan: 420, produksi: 430 },
  ];

  return (
    <MainPage>
      <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      <p className="text-muted-foreground">Overview produksi dan penjualan</p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
        {/* Card Produksi Rokok */}
        <div className="rounded-xl shadow-sm border overflow-hidden relative">
          <div className="flex items-center gap-4 px-6 py-4">
            <div className="p-3 rounded-lg bg-blue-400">
              <Package2 className="size-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Produksi</p>
              <p className="text-2xl font-semibold">15,234</p>
            </div>
          </div>
          <div className="flex w-full bg-blue-500 text-white">
            <div className="px-4 py-1">
              <p className="text-xs">+20.1% dari bulan lalu</p>
            </div>
          </div>
        </div>

        {/* Card Order Hari Ini */}
        <div className="rounded-xl shadow-sm border overflow-hidden relative">
          <div className="flex items-center gap-4 px-6 py-4">
            <div className="p-3 rounded-lg bg-yellow-400">
              <ShoppingCart className="size-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Order Hari Ini</p>
              <p className="text-2xl font-semibold">24</p>
            </div>
          </div>
          <div className="flex w-full bg-yellow-500 text-white">
            <div className="px-4 py-1">
              <p className="text-xs">12 order selesai diproses</p>
            </div>
          </div>
        </div>

        {/* Card Invoice Terbaru */}
        <div className="rounded-xl shadow-sm border overflow-hidden relative">
          <div className="flex items-center gap-4 px-6 py-4">
            <div className="p-3 rounded-lg bg-green-400">
              <Receipt className="size-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Invoice Pending</p>
              <p className="text-2xl font-semibold">8</p>
            </div>
          </div>
          <div className="flex w-full bg-green-500 text-white">
            <div className="px-4 py-1">
              <p className="text-xs">Menunggu pembayaran</p>
            </div>
          </div>
        </div>

        {/* Card Pendapatan Bulanan */}
        <div className="rounded-xl shadow-sm border overflow-hidden relative">
          <div className="flex items-center gap-4 px-6 py-4">
            <div className="p-3 rounded-lg bg-red-400">
              <DollarSign className="size-6 text-white" />
            </div>  
            <div>
              <p className="text-sm text-gray-500">Pendapatan Bulan Ini</p>
              <p className="text-2xl font-semibold">Rp 234.5M</p>
            </div>
          </div>
          <div className="flex w-full bg-red-500 text-white">
            <div className="px-4 py-1">
              <p className="text-xs">+15% dari bulan lalu</p>
            </div>
          </div>
        </div>
      </div>

      {/* Anda bisa menambahkan grafik atau tabel di bawah sini */}

      <SalesChart data={data} />
    </MainPage>
  );
}
