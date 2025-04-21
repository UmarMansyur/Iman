/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import {
  Package2,
  ShoppingCart,
  Box,
  CalendarIcon,
  FileText,
} from "lucide-react";
import MainPage from "@/components/main";
import CardDashboard from "@/components/card-dashboard";
import { useUserStore } from "@/store/user-store";
import { useEffect, useState } from "react";
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

  useEffect(() => {
    document.title = "Dashboard - Indera Distribution";
  }, []);

  const datas = [
    {
      icon: <Package2 />,
      title: "Total Pre Order",
      value: new Intl.NumberFormat("id-ID", { style: "decimal", currency: "IDR" }).format(data?.total_preorder),
      startDate: formatDateIndonesia(date?.from),
      endDate: formatDateIndonesia(date?.to),
      color: "blue",
    },
    {
      icon: <Box />,
      title: "Total Transaksi",
      value: new Intl.NumberFormat("id-ID", { style: "decimal", currency: "IDR" }).format(data?.total_transaction),
      startDate: formatDateIndonesia(date?.from),
      endDate: formatDateIndonesia(date?.to),
      color: "green",
    },
    {
      icon: <FileText />,
      title: "Order Pending",
      value: new Intl.NumberFormat("id-ID", { style: "decimal", currency: "IDR" }).format(data?.order_pending),
      startDate: formatDateIndonesia(date?.from),
      endDate: formatDateIndonesia(date?.to),
      color: "yellow",
    },
    {
      icon: <ShoppingCart />,
      title: "Order Success",
      value: new Intl.NumberFormat("id-ID", { style: "decimal", currency: "IDR" }).format(data?.order_success),
      startDate: formatDateIndonesia(date?.from),
      endDate: formatDateIndonesia(date?.to),
      color: "red",
    },
  ];

  const fetchData = async () => {
    setLoading(true);
    const startDate = date?.from ? formatDateIndonesia(date.from) : "";
    const endDate = date?.to ? formatDateIndonesia(date.to) : "";
    let response;

    if (startDate && endDate) {
      // tambah user_id
      response = await fetch(
        "/api/distributor/dashboard?start_date=" +
          startDate +
          "&end_date=" +
          endDate +
          "&user_id=" +
          user?.id
      ); 
    } else {
      response = await fetch(
        "/api/distributor/dashboard?user_id=" +
          user?.id
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
  }, [date, user?.id]);

  return loading ? (
    <LoaderScreen />
  ) : (
    <MainPage>
      <h2 className="text-3xl font-bold tracking-tight mb-0">Dashboard</h2>
      <p className="text-muted-foreground">Selamat Datang, {user?.username}</p>
      <div className="flex items-center justify-between">
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
            color={data.color}
          />
        ))}
      </div>
    </MainPage>
  );
}
