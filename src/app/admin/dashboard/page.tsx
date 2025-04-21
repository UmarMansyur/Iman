/* eslint-disable @typescript-eslint/no-explicit-any */
import MainPage from "@/components/main";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PaymentTypeChart } from "@/components/views/payment-type";
import { SalesChart } from "@/components/views/sales-chart";
import TableInvoice from "@/components/views/table-invoice";
import {
  Box,
  Building2,
  CircleDollarSign,
  ShoppingCart,
  Truck,
  Users,
} from "lucide-react";
import { DashboardCard } from "@/components/views/dashboard-card";
import BreadcrumbNav from "@/components/breadcrumb";

export default async function Page() {
  const dashboardCards = [
    {
      title: "Total Pengguna",
      background: "blue",
      icon: <Users className="w-4 h-4 text-blue-500" />,
      value: 100,
      details: {
        left: [
          { label: "12 Owner", value: "" },
          { label: "24 Operator", value: "" },
        ],
        right: [
          { label: "Jenis Kelamin", value: "" },
          { label: "12 Laki-laki", value: "12 Perempuan" },
        ],
      },
    },
    {
      title: "Total Pabrik",
      background: "yellow",
      icon: <Building2 className="w-4 h-4 text-yellow-500" />,
      value: 100,
      details: {
        left: [
          { label: "12 Aktif", value: "" },
          { label: "24 Tidak Aktif", value: "" },
        ],
        right: [
          { label: "12 Pengajuan", value: "" },
          { label: "12 Ditolak", value: "" },
        ],
      },
    },
    {
      title: "Total Penjualan",
      background: "green",
      icon: <CircleDollarSign className="w-4 h-4 text-green-500" />,
      value: 12000000,
      details: {
        left: [
          { label: "Mei 2024", value: "6.000.000" },
          { label: "", value: "" },
        ],
        right: [
          { label: "Akumulasi Sebelum Mei 2024", value: "6.000.000" },
          { label: "", value: "" },
        ],
      },
    },
    {
      title: "Total Produk",
      background: "red",
      icon: <Box className="w-4 h-4 text-red-500" />,
      value: 12,
      details: {
        left: [
          { label: "Mei 2024", value: "12" },
          { label: "", value: "" },
        ],
        right: [
          { label: "Sebelumnya", value: "13 Produk" },
          { label: "Aktif", value: "12" },
        ],
      },
    },
  ];

  const data = [
    {
      title: "Jumlah Hak Akses",
      background: "bg-blue-50",
      backgroundColor: "blue",
      icon: <Users className="w-6 h-6 text-blue-600" />,
      value: 100,
    },
    {
      title: "Pendapatan Hari Ini",
      background: "bg-secondary2/20",
      backgroundColor: "yellow",
      icon: <CircleDollarSign className="w-6 h-6 text-yellow-600" />,
      value: 100,
    },
    {
      title: "Total Pemesanan Hari Ini",
      background: "bg-green-50",
      backgroundColor: "green",
      icon: <ShoppingCart className="w-6 h-6 text-green-600" />,
      value: 100,
    },
    {
      title: "Total Pengiriman Hari Ini",
      background: "bg-red-50",
      backgroundColor: "red",
      icon: <Truck className="w-6 h-6 text-red-600" />,
      value: 100,
    },
  ];

  return (
    <MainPage>
      <BreadcrumbNav
        list={[
          { label: "Administrator", href: "/admin/dashboard" },
          { label: "Dashboard", href: "/admin/dashboard" },
        ]}
      />
      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-4 items-start">
        {dashboardCards.map((card, index) => (
          <div key={index}>
            <DashboardCard
              {...card}
              background={
                card.background as
                  | "red"
                  | "blue"
                  | "green"
                  | "yellow"
                  | "purple"
                  | "pink"
              }
            />
          </div>
        ))}
      </div>
      <div className="grid md:grid-cols-2 mt-4 gap-10">
        <div>
          <SalesChart />
          <div className="mt-5 bg-white rounded-lg p-5">
            <TableInvoice />
          </div>
        </div>

        <div>
          <div className="grid grid-cols-2 gap-4 mb-5">
            {data.map((item: any) => (
              <Card
                className={`p-2 duration-100 ease-in-out ${
                  item.backgroundColor === "blue"
                    ? "hover:bg-[#3B82F6]"
                    : item.backgroundColor === "yellow"
                    ? "hover:bg-[#FEC53D]"
                    : item.backgroundColor === "green"
                    ? "hover:bg-[#4AD991]"
                    : "hover:bg-[#FF9066]"
                } hover:lg:-rotate-6 hover:rounded-2xl hover:text-white`}
                key={item.title}
              >
                <CardHeader className="mb-0 pb-2 bg-transparent">
                  <CardTitle className="flex items-center gap-2 mb-5">
                    <div
                      className={`flex gap-2 rounded-2xl ${
                        item.backgroundColor === "blue"
                          ? "bg-[#3B82F6]/20"
                          : item.backgroundColor === "yellow"
                          ? "bg-[#FEC53D]/20"
                          : item.backgroundColor === "green"
                          ? "bg-[#4AD991]/20"
                          : "bg-[#FF9066]/20"
                      } w-18 h-18 items-center justify-center p-4`}
                    >
                      {item.icon}
                    </div>
                    <small className="hover:text-white">{item.title}</small>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex items-center gap-2 justify-between">
                    <p className="text-4xl font-medium">{item.value}</p>
                  </div>
                  <span className="text-xs hover:text-white">{item.title}</span>
                </CardContent>
              </Card>
            ))}
          </div>
          <PaymentTypeChart />
        </div>
      </div>
    </MainPage>
  );
}
