"use client";
import { useEffect, useState } from "react";
import { columns } from "./column";
import { DataTable } from "./data-table";
import { Card, CardHeader } from "@/components/ui/card";
import { CalendarIcon, Search } from "lucide-react";
import MainPage from "@/components/main";
import LoaderScreen from "@/components/views/loader";
import { Input } from "@/components/ui/input";
import { useUserStore } from "@/store/user-store";
import { useQuery } from "@tanstack/react-query";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";

// Tambahkan fungsi helper untuk format bulan dalam Bahasa Indonesia
const formatDateIndonesia = (date: Date) => {
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
};

export default function PabrikPage() {
  useEffect(() => {
    document.title = "Laporan Order - Indera Distribution";
  }, []);

  const [searchInput, setSearchInput] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [filters, setFilters] = useState({
    search: "",
    sortBy: "id",
    sortOrder: "asc",
  });

  const { user } = useUserStore();

  // Modifikasi state date untuk menghapus temporary state yang tidak diperlukan
  const [date, setDate] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });

  // Menggunakan React Query untuk fetch data
  const { data: queryData, isLoading } = useQuery({
    queryKey: [
      "transactions",
      pagination,
      filters,
      user?.factory_selected?.id,
      date,
    ],
    queryFn: async () => {
      if (!user) return { data: [], pagination: { total: 0, totalPages: 0 } };

      const factoryId = user?.factory_selected?.id;
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search: filters.search,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      });

      // Tambahkan filter date ke query params
      if (date?.from) {
        queryParams.set("start_date", format(date.from, "yyyy-MM-dd"));
      }
      if (date?.to) {
        // Jika hanya memilih satu tanggal, gunakan tanggal yang sama untuk end_date
        const endDate = date.to || date.from;
        queryParams.set("end_date", format(endDate, "yyyy-MM-dd"));
      }

      if (factoryId) {
        queryParams.set("factory_id", factoryId.toString());
      }

      const response = await fetch(`/api/laporan-order?${queryParams}`);
      const result = await response.json();

      setPagination((prev) => ({
        ...prev,
        total: result.pagination.total,
        totalPages: result.pagination.totalPages,
      }));

      return result;
    },
    enabled: !!user,
  });

  // Handle search dengan debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput }));
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({
      ...prev,
      page: newPage + 1,
    }));
  };

  const handleDateChange = (newDate: DateRange | undefined) => {
    // Langsung set date tanpa logika tambahan
    setDate(newDate);

    // Reset pagination ke halaman pertama jika ada perubahan tanggal
    if (newDate?.from || newDate?.to) {
      setPagination((prev) => ({ ...prev, page: 1 }));
    }
  };

  return (
    <MainPage>
      {isLoading ? (
        <LoaderScreen />
      ) : (
        <Card>
          <CardHeader className="border-b p-4 mb-2">
            <h4 className="text-base font-semibold mb-0">Laporan Order</h4>
            <p className="text-xs text-muted-foreground">
              Laporan order yang telah dilakukan dapat dilihat detailnya dengan
              mengklik tombol detail.
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
                  // range

                  onChange={(e) => setSearchInput(e.target.value)}
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
                      <CalendarIcon />
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
            </div>
          </div>
          <DataTable
            columns={columns(pagination.page, pagination.limit)}
            data={queryData?.data || []}
            pagination={pagination}
            sorting={(sortBy, sortOrder) => {
              setFilters((prev) => ({ ...prev, sortBy, sortOrder }));
            }}
            onPageChange={handlePageChange}
            onPageSizeChange={(size) => {
              setPagination((prev) => ({ ...prev, limit: size, page: 1 }));
            }}
          />
        </Card>
      )}
    </MainPage>
  );
}
