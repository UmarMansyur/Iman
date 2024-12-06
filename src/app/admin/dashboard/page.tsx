/* eslint-disable @typescript-eslint/no-explicit-any */
import MainPage from "@/components/main";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { PaymentTypeChart } from "@/components/views/payment-type";

import { SalesChart } from "@/components/views/sales-chart";
import TableInvoice from "@/components/views/table-invoice";
import {
  ArrowUpRight,
  Box,
  Building2,
  CircleDollarSign,
  ShoppingCart,
  Truck,
  Users,
} from "lucide-react";

export default function Page() {
  const data = [
    {
      title: "Jumlah Hak Akses",
      background: "bg-blue-50",
      icon: <Users className="w-6 h-6 text-blue-600" />,
      value: 100,
    },
    {
      title: "Pendapatan Hari Ini",
      background: "bg-yellow-50",
      icon: <CircleDollarSign className="w-6 h-6 text-yellow-600" />,
      value: 100,
    },
    {
      title: "Total Pemesanan Hari Ini",
      background: "bg-green-50",
      icon: <ShoppingCart className="w-6 h-6 text-green-600" />,
      value: 100,
    },
    {
      title: "Total Pengiriman Hari Ini",
      background: "bg-red-50",
      icon: <Truck className="w-6 h-6 text-red-600" />,
      value: 100,
    },
  ];
  return (
    <MainPage>
      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-4 items-start">
        <div>
          <Card className="p-1 bg-blue-500 text-white">
            <div className="hover:bg-gradient-to-r hover:lg:-rotate-6 hover:from-blue-500 hover:to-blue-600 hover:rounded-2xl hover:text-white">
              <CardHeader className="mb-0 pb-2 bg-transparent">
                <CardTitle className="flex justify-between">
                  <small className="hover:text-white">Total Pengguna</small>
                  <Button
                    variant="ghost"
                    size={"icon"}
                    className="bg-transparent hover:bg-transparent"
                  >
                    <ArrowUpRight className="w-8 h-8 hover:text-white font-bold" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="flex items-center gap-2 pb-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="p-2 rounded-full bg-white/50"
                  >
                    <Users className="w-4 h-4 text-blue-500" />
                  </Button>
                  <p className="text-4xl font-medium hover:text-white ps-5">
                    100
                  </p>
                </div>
                <div className="flex gap-2 justify-between">
                  <div className="flex flex-col">
                    <p className="text-sm hover:text-white">12 Owner</p>
                    <p className="text-sm hover:text-white">24 Operator</p>
                  </div>
                  <div className="flex flex-col">
                    <p className="text-sm hover:text-white">Jenis Kelamin</p>
                    <div className="flex gap-2">
                      <p className="text-xs hover:text-white">12 Laki-laki</p>
                      <p className="text-xs hover:text-white">12 Perempuan</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        </div>
        <div>
          <Card className="p-2 duration-100 ease-in-out hover:bg-gradient-to-r hover:lg:-rotate-6 hover:from-blue-500 hover:to-blue-600 hover:rounded-2xl hover:text-white bg-gradient-to-r from-yellow-50 to-white">
            <CardHeader className="mb-0 pb-2 bg-transparent">
              <CardTitle className="flex justify-between">
                <small className="hover:text-white">Total Pabrik</small>
                <Button
                  variant="ghost"
                  size={"icon"}
                  className="bg-transparent hover:bg-transparent"
                >
                  <ArrowUpRight className="w-8 h-8 font-bold hover:text-white" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex items-center gap-2 pb-2 justify-between">
                <Button
                  variant="outline"
                  size="icon"
                  className="p-2 rounded-full bg-white/50"
                >
                  <Building2 className="w-4 h-4 text-blue-500" />
                </Button>
                <p className="text-4xl font-medium ps-5">100</p>
              </div>
              <div className="flex gap-2 justify-between">
                <div className="flex flex-col">
                  <p className="text-sm hover:text-white">12 Aktif</p>
                  <p className="text-sm hover:text-white">24 Tidak Aktif</p>
                </div>
                <div className="flex flex-col">
                  <p className="text-sm hover:text-white">12 Pengajuan</p>
                  <p className="text-sm hover:text-white text-end">
                    12 Ditolak
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card className="p-2 duration-100 ease-in-out hover:bg-gradient-to-r hover:lg:-rotate-6 hover:from-blue-500 hover:to-blue-600 hover:rounded-2xl hover:text-white bg-gradient-to-r from-green-50 to-white">
            <CardHeader className="mb-0 pb-2 bg-transparent">
              <CardTitle className="flex justify-between">
                <small className="hover:text-white">Total Penjualan</small>
                <Button
                  variant="ghost"
                  size={"icon"}
                  className="bg-transparent hover:bg-transparent"
                >
                  <ArrowUpRight className="w-8 h-8 font-bold hover:text-white" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex items-center gap-2 pb-2 justify-between">
                <Button
                  variant="outline"
                  size="icon"
                  className="p-2 rounded-full bg-white/50"
                >
                  <CircleDollarSign className="w-4 h-4 text-blue-500" />
                </Button>
                <p className="text-4xl font-medium ps-5">12.000.000</p>
              </div>
              <div className="flex gap-2 justify-between">
                <div className="flex flex-col">
                  <p className="text-sm hover:text-white">Mei 2024</p>
                  <p className="text-sm hover:text-white">6.000.000</p>
                </div>
                <div className="flex flex-col">
                  <p className="text-sm hover:text-white">
                    Akumulasi Sebelum Mei 2024
                  </p>
                  <p className="text-sm hover:text-white text-end">6.000.000</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card className="p-2 duration-100 ease-in-out hover:bg-gradient-to-r hover:lg:-rotate-6 hover:from-blue-500 hover:to-blue-600 hover:rounded-2xl hover:text-white bg-gradient-to-r from-red-50 to-white">
            <CardHeader className="mb-0 pb-2 bg-transparent">
              <CardTitle className="flex justify-between">
                <small className="hover:text-white">Total Produk</small>
                <Button
                  variant="ghost"
                  size={"icon"}
                  className="bg-transparent hover:bg-transparent"
                >
                  <ArrowUpRight className="w-8 h-8  font-bold" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex items-center gap-2 pb-2 justify-between">
                <Button
                  variant="outline"
                  size="icon"
                  className="p-2 rounded-full bg-white/50"
                >
                  <Box className="w-4 h-4 text-blue-500" />
                </Button>
                <p className="text-4xl font-medium ps-5">12</p>
              </div>
              <div className="flex gap-2 justify-between">
                <div className="flex flex-col">
                  <p className="text-sm hover:text-white">Mei 2024</p>
                  <p className="text-sm hover:text-white">12</p>
                </div>
                <div className="flex flex-col">
                  <p className="text-sm hover:text-white">Sebelumnya</p>
                  <p className="text-sm hover:text-white text-end">13 Produk</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
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
                className="p-2 duration-100 ease-in-out hover:bg-gradient-to-r hover:lg:-rotate-6 hover:from-blue-500 hover:to-blue-600 hover:rounded-2xl hover:text-white"
                key={item.title}
              >
                <CardHeader className="mb-0 pb-2 bg-transparent">
                  <CardTitle className="flex items-center gap-2 mb-5">
                    <div className={`flex gap-2 rounded-2xl ${item.background} w-18 h-18 items-center justify-center p-4`}>
                      {item.icon}
                    </div>
                    <small className="hover:text-white">{item.title}</small>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex items-center gap-2 justify-between">
                    <p className="text-4xl font-medium">{item.value}</p>
                  </div>
                  <span className="text-xs hover:text-white">
                    {item.title}
                  </span>
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
