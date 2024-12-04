import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import { PaymentTypeChart } from "@/components/views/payment-type";

import { SalesChart } from "@/components/views/sales-chart";
import TableInvoice from "@/components/views/table-invoice";
import { ArrowUpRight, Box, Building2, CircleDollarSign, Users } from "lucide-react";

export default function Page() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex fixed w-full z-50 top-0 bg-background h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="">
                <BreadcrumbLink href="#">Administrator</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="" />
              <BreadcrumbItem>
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 mt-20">
          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-4 items-start">
            <div>
              <Card className="p-1">
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
                        <p className="text-sm hover:text-white">
                          12 Owner
                        </p>
                        <p className="text-sm hover:text-white">
                          24 Operator
                        </p>
                      </div>
                      <div className="flex flex-col">
                        <p className="text-sm hover:text-white">
                          Jenis Kelamin
                        </p>
                        <div className="flex gap-2">
                          <p className="text-xs hover:text-white">
                            12 Laki-laki
                          </p>
                          <p className="text-xs hover:text-white">
                            12 Perempuan
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            </div>
            <div>
              <Card className="p-2 duration-100 ease-in-out hover:bg-gradient-to-r hover:lg:-rotate-6 hover:from-blue-500 hover:to-blue-600 hover:rounded-2xl hover:text-white">
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
                      <p className="text-sm hover:text-white">
                        24 Tidak Aktif
                      </p>
                    </div>
                    <div className="flex flex-col">
                      <p className="text-sm hover:text-white">
                        12 Pengajuan
                      </p>
                      <p className="text-sm hover:text-white text-end">
                        12 Ditolak
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div>
              <Card className="p-2 duration-100 ease-in-out hover:bg-gradient-to-r hover:lg:-rotate-6 hover:from-blue-500 hover:to-blue-600 hover:rounded-2xl hover:text-white">
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
                      <p className="text-sm hover:text-white text-end">
                        6.000.000
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div>
              <Card className="p-2 duration-100 ease-in-out hover:bg-gradient-to-r hover:lg:-rotate-6 hover:from-blue-500 hover:to-blue-600 hover:rounded-2xl hover:text-white">
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
                      <p className="text-sm hover:text-white">
                        Sebelumnya
                      </p>
                      <p className="text-sm hover:text-white text-end">
                        13 Produk
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          <div className="grid md:grid-cols-2 mt-4">
            <SalesChart />
            <PaymentTypeChart />
          </div>
          <div className="mt-5">
            <TableInvoice />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
