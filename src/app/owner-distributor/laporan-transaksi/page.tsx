/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { Card, CardHeader } from "@/components/ui/card";
import { Search, FileText, Sheet } from "lucide-react";
import MainPage from "@/components/main";
import LoaderScreen from "@/components/views/loader";
import { Input } from "@/components/ui/input";
import debounce from "lodash/debounce";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { useUserStore } from "@/store/user-store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDateIndonesia } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

type TransactionFilters = {
  search: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
  startDate: string;
  endDate: string;
};

type TransactionData = {
  data: {
    id: number;
    [key: string]: any;
  }[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export default function TransaksiDistributorPage() {
  const { user } = useUserStore();
  const [searchInput, setSearchInput] = useState<string>("");
  const [queryParams, setQueryParams] = useState<
    TransactionFilters & {
      page: number;
      limit: number;
      filterPayment: string;
      filterStatus: string;
      factory_id: string;
      startDate: string;
      endDate: string;
    }
  >({
    page: 1,
    limit: 10,
    search: "",
    sortBy: "id",
    sortOrder: "asc",
    filterPayment: "",
    filterStatus: "",
    factory_id: "",
    startDate: "",
    endDate: "",
  });
  const [payment, setPayment] = useState<any[]>([]);
  const [factories, setFactories] = useState<any[]>([]);
  
  // Tambahkan state untuk filter
  const [filters, setFilters] = useState({
    search: "",
    sortBy: "id",
    sortOrder: "asc" as "asc" | "desc",
    filterPayment: "",
    filterStatus: "",
    factory_id: "",
    startDate: "",
    endDate: ""
  });

  // Status pengiriman
  const statusPayment = [
    {
      id: "Pending",
      name: "Menunggu Konfirmasi",
    },
    {
      id: "Paid",
      name: "Dibayar Sebagian",
    },
    {
      id: "Paid_Off",
      name: "Lunas",
    },
    {
      id: "Failed",
      name: "Gagal",
    },
    {
      id: "Cancelled",
      name: "Ditolak",
    },
  ];

  // Fetch payment methods
  const fetchPayment = async () => {
    if (!user) return;
    if (payment.length > 0) return;
    const response = await fetch("/api/payment?limit=10000&page=1");
    const data = await response.json();
    setPayment(data.payments);
  };

  // Fetch factories
  const fetchFactories = async () => {
    if (!user) return;
    if (factories.length > 0) return;
    const response = await fetch("/api/factory?limit=10000&page=1");
    const data = await response.json();
    const factoriesData = {
      id: "other",
      name: "Non Pabrik",
      
    }
    setFactories([...data.factories, factoriesData]);
  };

  useEffect(() => {
    fetchPayment();
    fetchFactories();
  }, [user]);

  // Handle filter changes
  const handleFilterPayment = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      filterPayment: value,
    }));
    setQueryParams((prev) => ({
      ...prev,
      filterPayment: value,
      page: 1,
    }));
  };

  const handleFilterStatus = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      filterStatus: value,
    }));
    setQueryParams((prev) => ({
      ...prev,
      filterStatus: value,
      page: 1,
    }));
  };


  // Download handlers
  const handleDownloadExcel = () => {
    const queryParams = new URLSearchParams({
      download: "excel",
      factory_id: filters.factory_id || user?.factory_selected?.id?.toString() || "",
      startDate: filters.startDate,
      endDate: filters.endDate,
      search: filters.search,
      filterPayment: filters.filterPayment,
      filterStatus: filters.filterStatus,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
      distributor_id: user?.id.toString() || "",

    });
    window.open(`/api/distributor/owner-transaction2/excel?${queryParams}`, "_blank");
  };

  const handleDownloadPDF = () => {
    const queryParams = new URLSearchParams({
      download: "pdf",
      factory_id: filters.factory_id || user?.factory_selected?.id?.toString() || "",
      startDate: filters.startDate,
      endDate: filters.endDate,
      search: filters.search,
      filterPayment: filters.filterPayment,
      filterStatus: filters.filterStatus,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
      // user_id: user?.id.toString() || "",
      distributor_id: user?.id.toString() || "",
    });
    window.open(`/api/distributor/owner-transaction2/pdf?${queryParams}`, "_blank");
  };

  useEffect(() => {
    document.title = "Laporan Transaksi - Indera Distribution";
  }, []);

  // Fetch Transaksi
  const fetchTransaksi = async (): Promise<TransactionData> => {
    try {
      const { page, limit, search, sortBy, sortOrder, filterPayment, filterStatus, factory_id, startDate, endDate } = queryParams;

      if (user?.id && user?.factory_selected?.id) {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          search,
          sortBy,
          sortOrder,
          filterPayment,
          filterStatus,
          factory_id: factory_id || user.factory_selected.id.toString(),
          startDate: startDate,
          endDate: endDate,
        });

        params.set("distributor_id", user.id.toString());
        const response = await fetch(`/api/distributor/owner-transaction2?${params}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      }

      // Mengembalikan data kosong jika user atau factory tidak ada
      return {
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      };
    } catch (error) {
      console.error("Error fetching transactions:", error);
      throw new Error("Gagal mengambil data transaksi");
    }
  };


  const { data: transaksiData, isLoading: isLoadingTransaksi } =
    useQuery<TransactionData>({
      queryKey: ["transaksi-distributor", queryParams, user?.id, user?.factory_selected?.id],
      queryFn: fetchTransaksi,
      enabled: !!user?.id && !!user?.factory_selected?.id,
    });

  const debouncedSearch = useMemo(
    () =>
      debounce((searchValue: string) => {
        setQueryParams((prev) => ({
          ...prev,
          search: searchValue,
          page: 1,
        }));
      }, 500),
    []
  );

  const handleSearchInputChange = useCallback(
    (value: string) => {
      setSearchInput(value);
      debouncedSearch(value);
    },
    [debouncedSearch]
  );

  const updateQueryParams = (updates: Partial<typeof queryParams>) => {
    setQueryParams((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  const [date, setDate] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });

  // Tambahkan handler untuk calendar
  const handleDateChange = (newDate: DateRange | undefined) => {
    if (!newDate) {
      setDate({
        from: undefined,
        to: undefined,
      });
      setFilters(prev => ({
        ...prev,
        startDate: "",
        endDate: "",
      }));
      setQueryParams(prev => ({
        ...prev,
        startDate: "",
        endDate: "",
      }));
    } else {
      if (newDate.from && !newDate.to) {
        setDate({
          from: newDate.from,
          to: newDate.from,
        });
        setFilters(prev => ({
          ...prev,
          startDate: newDate?.from?.toISOString() || "",
          endDate: newDate?.from?.toISOString() || "",
        }));
      } else {
        setDate(newDate);
        setFilters(prev => ({
          ...prev,
          startDate: newDate?.from?.toISOString() || "",
          endDate: newDate?.to?.toISOString() || "",
        }));
        setQueryParams(prev => ({
          ...prev,
          startDate: newDate?.from?.toISOString() || "",
          endDate: newDate?.to?.toISOString() || "",
          page: 1,
        }));
      }
    }
  };

  if (isLoadingTransaksi) {
    return <LoaderScreen />;
  }

  return (
    <MainPage>
      <div className="space-y-4">
        <Card>
          <CardHeader className="border-b p-4">
            <h4 className="text-base font-semibold mb-0">
              Laporan Transaksi
            </h4>
            <p className="text-xs text-muted-foreground">
              Laporan semua transaksi distributor dapat dilihat dan diunduh di sini!
            </p>
          </CardHeader>

          <div className="flex justify-between items-center p-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Masukkan kode invoice"
                  className="ps-8"
                  onChange={(e) => handleSearchInputChange(e.target.value)}
                  value={searchInput}
                />
              </div>
              
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
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date?.from ? (
                        date.to ? (
                          <>
                            {formatDateIndonesia(date.from)} -{" "}
                            {formatDateIndonesia(date.to)}
                          </>
                        ) : (
                          formatDateIndonesia(date.from)
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
              
              <div className="w-56">
                <Select
                  onValueChange={handleFilterStatus}
                  defaultValue={filters.filterStatus}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Status Pembayaran" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status Pembayaran</SelectItem>
                    {statusPayment.map((status) => (
                      <SelectItem key={status.id} value={status.id}>
                        {status.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-56">
                <Select
                  onValueChange={handleFilterPayment}
                  defaultValue={filters.filterPayment}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Metode Pembayaran" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Metode Pembayaran</SelectItem>
                    {payment?.map((item: any) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="ml-auto flex justify-end items-center gap-2">
              <Button
                type="button"
                className="bg-green-600 text-white hover:bg-green-700"
                onClick={handleDownloadExcel}
              >
                <Sheet className="w-4 h-4 mr-2" /> Download Excel
              </Button>
              <Button
                type="button"
                className="bg-red-500 text-white hover:bg-red-600"
                onClick={handleDownloadPDF}
              >
                <FileText className="w-4 h-4 mr-2" /> Export PDF
              </Button>
            </div>
          </div>
          <div className="p-4">
            <DataTable
              columns={columns}
              data={transaksiData?.data || []}
              pagination={
                transaksiData?.pagination || {
                  page: 1,
                  limit: 10,
                  total: 0,
                  totalPages: 1,
                }
              }
              sorting={(sortBy, sortOrder) => {
                updateQueryParams({
                  sortBy,
                  sortOrder: sortOrder as "asc" | "desc",
                });
              }}
              onPageChange={(page) => {
                updateQueryParams({ page });
              }}
              onPageSizeChange={(size) => {
                updateQueryParams({ limit: size, page: 1 });
              }}
            />
          </div>
        </Card>
      </div>
    </MainPage>
  );
}
