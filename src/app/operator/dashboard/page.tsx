'use client'
import { Package2, ShoppingCart, Receipt, DollarSign } from "lucide-react";
import MainPage from "@/components/main";
import CardDashboard from "@/components/card-dashboard";

export default function Layout() {
  const datas = [
    {
      icon: <Package2 />,
      title: "Total Produksi",
      value: 15234,
      percentage: 20.1,
      startDate: "Januari 2024",
      endDate: "Desember 2024",
    },
    {
      icon: <ShoppingCart />,
      title: "Order Hari Ini",
      value: 24,
      percentage: 10.5,
      startDate: "Januari 2024",
      endDate: "Desember 2024",
    },
    {
      icon: <Receipt />,
      title: "Invoice Pending",
      value: 8,
      percentage: 10.5,
      startDate: "Januari 2024",
      endDate: "Desember 2024",
    },
    {
      icon: <DollarSign />,
      title: "Pendapatan Bulan Ini",
      value: 234500000,
      percentage: 15,
      startDate: "Januari 2024",
      endDate: "Desember 2024",
    },
  ];

  return (
    <MainPage>
      <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      <p className="text-muted-foreground">Overview produksi dan penjualan</p>
      <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-4 mt-6">
        {datas.map((data, index) => (
          <CardDashboard key={index} {...data} />
        ))}
      </div>
    </MainPage>
  );
}