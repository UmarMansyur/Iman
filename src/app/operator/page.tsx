/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import {
  Package2,
  ShoppingCart,
  DollarSign,
  Box,
  PackageOpen,
  FileChartColumn,
  User2Icon,
  CalendarIcon,
  Percent,
} from "lucide-react";
import MainPage from "@/components/main";
import CardDashboard from "@/components/card-dashboard";
import { useUserStore } from "@/store/user-store";
import { useEffect, useState } from "react";
import BarChartOwner from "./components/BarChart";
import LoaderScreen from "@/components/views/loader";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";

import { formatDateIndonesia } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import { LineChartComponent } from "./components/LineChart";
import BarChart2 from "./components/BarChart2";
import { Payment } from "./components/Payment";

export default function Layout() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useUserStore();
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
  });

  const handleDateChange = (date: DateRange | undefined) => {
    setDate(date);
    fetchData();
  };

  const datas = [
    {
      icon: <Package2 />,
      title: "Total Produksi",
      value: new Intl.NumberFormat("id-ID", { style: "decimal", currency: "IDR" }).format(data?.total_production),
      startDate: formatDateIndonesia(date?.from),
      endDate: formatDateIndonesia(date?.to),
    },
    {
      icon: <Box />,
      title: "Total Produk",
      value: new Intl.NumberFormat("id-ID", { style: "decimal", currency: "IDR" }).format(data?.total_product),
      startDate: formatDateIndonesia(date?.from),
      endDate: formatDateIndonesia(date?.to),
    },
    {
      icon: <User2Icon />,
      title: "Total Operator",
      value: new Intl.NumberFormat("id-ID", { style: "decimal", currency: "IDR" }).format(data?.total_operator),
      startDate: formatDateIndonesia(date?.from),
      endDate: formatDateIndonesia(date?.to),
    },
    {
      icon: <ShoppingCart />,
      title: "Order Hari Ini",
      value: new Intl.NumberFormat("id-ID", { style: "decimal", currency: "IDR" }).format(data?.total_order_today),
      startDate: formatDateIndonesia(date?.from),
      endDate: formatDateIndonesia(date?.to),
    },
    {
      icon: <FileChartColumn />,
      title: "Invoice Pending",
      value: new Intl.NumberFormat("id-ID", { style: "decimal", currency: "IDR" }).format(data?.total_invoice_pending),
      startDate: formatDateIndonesia(date?.from),
      endDate: formatDateIndonesia(date?.to),
    },
    {
      icon: <DollarSign />,
      title: "Pendapatan Produk",
      value: new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(data?.total_income).slice(0, -3),
      startDate: formatDateIndonesia(date?.from),
      endDate: formatDateIndonesia(date?.to),
    },
    {
      icon: <Percent />,
      title: "Pendapatan Jasa",
      value: new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(data?.total_income_service).slice(0, -3),
      startDate: formatDateIndonesia(date?.from),
      endDate: formatDateIndonesia(date?.to),
    },
    {
      icon: <PackageOpen />,
      title: "Order Bahan Baku",
      value: new Intl.NumberFormat("id-ID", { style: "decimal", currency: "IDR" }).format(data?.total_order_bahan_baku),
      startDate: formatDateIndonesia(date?.from),
      endDate: formatDateIndonesia(date?.to),
    },
  ];

  const fetchData = async () => {
    setLoading(true);
    const startDate = date?.from ? formatDateIndonesia(date.from) : "";
    const endDate = date?.to ? formatDateIndonesia(date.to) : "";
    let response;
    if(!user?.factory_selected?.id) {
      setLoading(false);
      return;
    };
    if (startDate && endDate) {
      response = await fetch(
        "/api/owner/dashboard?factory_id=" +
          user?.factory_selected?.id +
          "&start_date=" +
          startDate +
          "&end_date=" +
          endDate
      ); 
    } else {
      response = await fetch(
        "/api/owner/dashboard?factory_id=" + user?.factory_selected?.id
      );
    }
    const data = await response.json();
    setData(data.data);
    setLoading(false);
  };

  useEffect(() => {
    document.title = "Dashboard - Indera Distribution";
  });

  useEffect(() => {
    fetchData();
  }, [user?.factory_selected?.id]);

  return loading ? (
    <LoaderScreen />
  ) : (
    <MainPage>
      <h2 className="text-3xl font-bold tracking-tight mb-0">Dashboard</h2>
      <p className="text-muted-foreground">Selamat Datang {user?.username}</p>
      <div>
        <div className={cn("grid gap-2")}>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-[300px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="text-muted-foreground" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {formatDateIndonesia(date.from)} -{" "}
                      {formatDateIndonesia(date.to)}
                    </>
                  ) : (
                    formatDateIndonesia(date.from) + " sd " + " - "
                  )
                ) : (
                  <span>Pilih Tanggal</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={handleDateChange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-1">
        {datas.map((data, index) => (
          <CardDashboard 
            key={index} 
            icon={data.icon}
            title={data.title}
            value={data.value}
            startDate={data.startDate}
            endDate={data.endDate}
          />
        ))}
      </div>
      <div className="flex flex-col mt-4 gap-4">
        <BarChartOwner title="Pendapatan Tahunan Layanan & Produk" description="Pendapatan Tahunan" chartData={data?.total_income_year} />
        <LineChartComponent title="Jumlah Penjualan Produk" description={"Jumlah Penjualan Produk dari Tanggal " + formatDateIndonesia(date?.from) + " sampai " + formatDateIndonesia(date?.to)} chartData={data?.product_day} />
        <LineChartComponent title="Jumlah Produksi Produk" description={"Jumlah Produksi Produk Bulan Ini"} chartData={data?.total_production_this_month} />
      </div>
      <div className="grid grid-cols-2 gap-4 mt-4">
        <BarChart2 title="Sisa Pembayaran Invoice" description="Sisa Pembayaran Invoice selama 12 bulan" chartData={data?.total_remaining_balance_perbulan} />
        <Payment title="Metode Pembayaran" description="Prosentase Pembayaran Invoice" chartData={data?.payment_method} />
      </div>
    </MainPage>
  );
}
