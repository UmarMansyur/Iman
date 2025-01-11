/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import MainPage from "@/components/main";
import { DataTable } from "./data-table";
import { columns } from "./column";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText, Search, Sheet } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useMemo, useCallback, useEffect } from "react";
import { debounce } from "lodash";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import LoaderScreen from "@/components/views/loader";
import { useUserStore } from "@/store/user-store";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { formatDateIndonesia } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface ServiceFilters {
  search: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

interface ServiceData {
  data: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function LokasiPengirimanPage() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  const [searchInput, setSearchInput] = useState("");
  const [queryParams, setQueryParams] = useState<
    ServiceFilters & {
      page: number;
      limit: number;
      startDate: Date | undefined;
      endDate: Date | undefined;
      filterStatus: string;
      filterPayment: string;
    }
  >({
    page: 1,
    limit: 10,
    search: "",
    sortBy: "id",
    sortOrder: "asc",
    startDate: undefined,
    endDate: undefined,
    filterStatus: "all",
    filterPayment: "all",
  });

  const { user } = useUserStore();

  const fetchServices = async () => {
    const {
      page,
      limit,
      search,
      sortBy,
      sortOrder,
      startDate,
      endDate,
      filterStatus,
      filterPayment,
    } = queryParams;
    const params = new URLSearchParams();

    params.append("page", page.toString());
    params.append("limit", limit.toString());
    params.append("search", search);
    params.append("sortBy", sortBy);
    params.append("sortOrder", sortOrder);

    if (startDate) {
      params.append("startDate", startDate.toISOString());
    }

    if (endDate) {
      params.append("endDate", endDate.toISOString());
    }

    params.append("filterStatus", filterStatus);
    params.append("filterPayment", filterPayment);

    if (user?.factory_selected?.id) {
      const response = await fetch(
        `/api/transaction-service?${params}&factory_id=${user?.factory_selected?.id}`
      );

      return response.json() as Promise<ServiceData>;
    } else {
      return {
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
      };
    }
  };

  const { data, isLoading, isError, error } = useQuery<ServiceData>({
    queryKey: ["transaction-service", queryParams],
    queryFn: fetchServices,
    placeholderData: (previousData) => previousData,
  });

  const query = useQueryClient();
  useEffect(() => {
    if (user?.factory_selected?.id) {
      query.invalidateQueries({ queryKey: ["transaction-service"] });
    }
  }, [user?.factory_selected?.id]);

  useEffect(() => {
    document.title = "Laporan Transaksi Jasa - Indera Distribution";
  }, []);

  const debouncedSearch = useMemo(
    () =>
      debounce((searchValue: string) => {
        setQueryParams((prev) => ({
          ...prev,
          search: searchValue,
          page: 1
        }));
      }, 500),
    []
  );

  // Handle input changes
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
      page: updates.page ?? prev.page,
    }));
  };

  const [filterStatus, setFilterStatus] = useState<any>("all")
  const [filterPayment, setFilterPayment] = useState<any>("all")

  const handleDateChange = (date: DateRange | undefined) => {
    setDate(date);
    setQueryParams((prev) => ({
      ...prev,
      startDate: date?.from,
      endDate: date?.to,
    }));
  };

  const handleFilterStatus = (value: string) => {
    setFilterStatus(value);
    setQueryParams((prev) => ({
      ...prev,
      filterStatus: value,
      page: 1, // Reset halaman saat filter berubah
    }));
  };

  const handleFilterPayment = (value: string) => {
    setFilterPayment(value);
    setQueryParams((prev) => ({
      ...prev,
      filterPayment: value, 
      page: 1, // Reset halaman saat filter berubah
    }));
  };

  const [statusPayment] = useState<Array<{ id: string; name: string }>>([
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
      id: "Unpaid",
      name: "Belum Dibayar",
    },
  ]);

  const [payment, setPayment] = useState<any[]>([]);
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);

  const handleDownloadExcel = () => {
    const params = new URLSearchParams();
    params.append("factory_id", user?.factory_selected?.id || "");
    params.append("startDate", date?.from?.toISOString() || "");
    params.append("endDate", date?.to?.toISOString() || "");
    params.append("filterStatus", filterStatus);
    params.append("filterPayment", filterPayment);
    window.open(`/api/transaction-service/excel?${params}`, "_blank");
  }

  const handleDownloadPDF = () => { 
    const params = new URLSearchParams();
    params.append("factory_id", user?.factory_selected?.id || "");
    params.append("startDate", date?.from?.toISOString() || "");
    params.append("endDate", date?.to?.toISOString() || "");
    params.append("filterStatus", filterStatus);
    params.append("filterPayment", filterPayment);
    window.open(`/api/transaction-service/pdf?${params}`, "_blank");
  }

  const fetchPayment = async () => {
    if (!user) return;
    if (payment.length > 0) return;
    setIsLoadingPayment(true);
    try {
      const response = await fetch("/api/payment?limit=10000&page=1");
      const data = await response.json();
      setPayment(data.payments);
    } finally {
      setIsLoadingPayment(false);
    }
  };

  useEffect(() => {
    fetchPayment();
  }, [user?.factory_selected?.id]);

  if (isError)
    return (
      <div>
        Error:{" "}
        {error instanceof Error ? error.message : "An unknown error occurred"}
      </div>
    );

  return (
    <MainPage>
      {isLoading ? (
        <LoaderScreen />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Daftar Transaksi Layanan Jasa</CardTitle>
            <CardDescription>
              Daftar transaksi layanan jasa yang tersedia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center pb-4">
              <div className="flex items-center gap-2">
                <div className="relative w-60">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    type="text"
                    placeholder="Masukkan kode transaksi..."
                    className="pl-8"
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
                <div className="w-56">
                  <Select
                    onValueChange={handleFilterStatus}
                    value={filterStatus}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Loading...</span>
                        </div>
                      ) : (
                        <SelectValue placeholder="Pilih Status Pembayaran">
                          {filterStatus === "all" 
                            ? "Semua Status Pembayaran"
                            : statusPayment.find(item => item.id === filterStatus)?.name ?? "Pilih Status Pembayaran"}
                        </SelectValue>
                      )}
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
                    value={filterPayment}
                    disabled={isLoadingPayment}
                  >
                    <SelectTrigger>
                      {isLoadingPayment ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Loading...</span>
                        </div>
                      ) : (
                        <SelectValue placeholder="Pilih Metode Pembayaran">
                          {filterPayment === "all"
                            ? "Semua Metode Pembayaran"
                            : payment.find(item => item.id === filterPayment)?.name ?? "Pilih Metode Pembayaran"}
                        </SelectValue>
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Metode Pembayaran</SelectItem>
                      {payment.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="ml-auto flex justify-end items-center gap-2">
              <Button
                type="button"
                className="bg-green-600 text-white hover:bg-green-700"
                onClick={handleDownloadExcel}
              >
                <Sheet className="w-4 h-4" /> Download Excel
              </Button>
              <Button
                type="button"
                className="bg-red-500 text-white hover:bg-red-600"
                onClick={handleDownloadPDF}
              >
                <FileText className="w-4 h-4" /> Export PDF
              </Button>
            </div>
              </div>
            </div>
           
              <DataTable
                columns={columns(
                  data?.pagination.page ?? 1,
                  data?.pagination.limit ?? 10
                )}
                data={data?.data ?? []}
                pagination={{
                  page: data?.pagination.page ?? 1,
                  limit: data?.pagination.limit ?? 10,
                  total: data?.pagination.total ?? 0,
                  totalPages: data?.pagination.totalPages ?? 0,
                }}
                sorting={(sortBy, sortOrder) => {
                  updateQueryParams({
                    sortBy,
                    sortOrder: sortOrder as "asc" | "desc",
                  });
                }}
                onPageChange={(newPage) => {
                  updateQueryParams({
                    page: newPage + 1,
                  });
                }}
                onPageSizeChange={(size) => {
                  updateQueryParams({
                    limit: size,
                    page: 1,
                  });
                }}
              />
          </CardContent>
        </Card>
      )}
    </MainPage>
  );
}

