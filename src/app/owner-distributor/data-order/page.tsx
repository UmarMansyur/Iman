/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { useEffect, useState, useCallback } from "react";
import { columns } from "./column";
import { DataTable } from "./data-table";
import { Card, CardHeader } from "@/components/ui/card";
import { FileText, Loader2, Search, Sheet } from "lucide-react";
import MainPage from "@/components/main";
import LoaderScreen from "@/components/views/loader";
import { Input } from "@/components/ui/input";
import debounce from "lodash/debounce";
import { PaymentSetting } from "@/lib/definitions";
import { useUserStore } from "@/store/user-store";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { formatDateIndonesia } from "@/lib/utils";

export default function PabrikPage() {
  const [data, setData] = useState<PaymentSetting[]>([]);
  const [date, setDate] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });

  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [payment, setPayment] = useState<any[]>([]);
  const fetchPayment = async () => {
    if (!user) return;
    if (payment.length > 0) return;
    const response = await fetch("/api/payment?limit=10000&page=1");
    const data = await response.json();
    setPayment(data.payments);
  };

  const [filters, setFilters] = useState({
    search: "",
    sortBy: "id",
    sortOrder: "asc",
    startDate: "",
    endDate: "",
    filterPayment: "",
    filterStatus: "",
    factory_id: "",
  });

  // Tambahkan state baru untuk nilai input search
  const [searchInput, setSearchInput] = useState("");
  const { user } = useUserStore();
  const fetchData = async () => {
    try {
      setLoading(true);
      if (!user) return;
      const factoryId = user?.factory_selected?.id;
      const params = {
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search: filters.search,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        startDate: filters.startDate,
        endDate: filters.endDate,
        type_preorder: "true",
        filterPayment: filters.filterPayment,
        filterStatus: filters.filterStatus,
        user_id: user?.id?.toString() || "",
        factory_id: filters.factory_id || "",
      };
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`/api/distributor/owner-transaction?${queryParams}`);
      const data = await response.json();

      setData(data.data);
      setPagination((prev) => ({
        ...prev,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages,
      }));
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
      setLoadingSearch(false);
    }
  };

  const [factories, setFactories] = useState<any[]>([]);
  
  // Tambahkan fungsi untuk mengambil data factory
  const fetchFactories = async () => {
    if (!user) return;
    if (factories.length > 0) return;
    const response = await fetch("/api/factory?limit=10000&page=1");
    const data = await response.json();
    setFactories([...data.factories, { id: 'other', name: 'Non Pabrik' }]);
  };

  useEffect(() => {
    fetchData();
    fetchPayment();
    fetchFactories();
  }, [
    pagination.page,
    pagination.limit,
    filters.search,
    filters.sortBy,
    filters.sortOrder,
    filters.endDate,
    user,
    filters.filterPayment,
    filters.filterStatus,
    filters.factory_id
  ]);

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setFilters((prev) => ({ ...prev, search: value }));
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 500),
    []
  );
  const [loadingSearch, setLoadingSearch] = useState(false);
  const handleSearch = (value: string) => {
    setSearchInput(value);
    setLoadingSearch(true);
    debouncedSearch(value);
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({
      ...prev,
      page: newPage + 1,
    }));
  };

  const handleDateChange = (newDate: DateRange | undefined) => {
    if (!newDate) {
      setDate({
        from: undefined,
        to: undefined,
      });
    } else {
      if (newDate.from && !newDate.to) {
        setDate({
          from: newDate.from,
          to: newDate.from,
        });
      } else {
        setFilters((prev) => ({
          ...prev,
          startDate: newDate?.from?.toISOString() || "",
          endDate: newDate?.to?.toISOString() || "",
        }));
        setDate(newDate);
      }
    }
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleFilterPayment = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      filterPayment: value,
      factory_id: user?.factory_selected?.id || "",
    }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };
  const handleFilterStatus = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      filterStatus: value,
      factory_id: user?.factory_selected?.id || "",
    }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleFilterFactory = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      factory_id: value,
    }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const [statusPayment, setStatusPayment] = useState<
    Array<{ id: string; name: string }>
  >([
    {
      id: "Pending",
      name: "Menunggu Konfirmasi",
    },
    {
      id: "Unpaid",
      name: "Belum Bayar",
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
  ]);

  const handleDownloadExcel = () => {
    const queryParams = new URLSearchParams({
      download: "excel",
      factory_id: user?.factory_selected?.id.toString() || "",
      startDate: filters.startDate,
      endDate: filters.endDate,
      search: filters.search,
      filterPayment: filters.filterPayment,
      filterStatus: filters.filterStatus,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
      page: pagination.page.toString(),
      limit: pagination.limit.toString(),
      type_preorder: "true",
      user_id: user?.id?.toString() || "",
    });
    window.open(`/api/distributor/owner-transaction/excel?${queryParams}`, "_blank");
  };

  const handleDownloadPDF = () => {
    const queryParams = new URLSearchParams({
      download: "pdf",
      factory_id: user?.factory_selected?.id.toString() || "",
      startDate: filters.startDate,
      endDate: filters.endDate,
      search: filters.search,
      filterPayment: filters.filterPayment,
      filterStatus: filters.filterStatus,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
      page: pagination.page.toString(),
      limit: pagination.limit.toString(),
      user_id: user?.id?.toString() || "",
    });
    window.open(`/api/distributor/owner-transaction/pdf?${queryParams}`, "_blank");
  };

  useEffect(() => {
    document.title = "Data Order - Indera Distribution";
  }, []);

  return (
    <MainPage>
      {loading ? (
        <LoaderScreen />
      ) : (
        <Card>
          <CardHeader className="border-b p-4 mb-2">
            <h4 className="text-base font-semibold mb-0">
              Data Order
            </h4>
            <p className="text-xs text-muted-foreground">
              Data order yang telah dilakukan dapat dilihat
              detailnya dengan mengklik tombol detail berupa icon mata pada
              kolom aksi.
            </p>
          </CardHeader>
          <div className="flex justify-between items-center p-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Cari kode invoice ..."
                  className="ps-8"
                  onChange={(e) => handleSearch(e.target.value)}
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
                        " justify-start text-left font-normal",
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
                  onValueChange={(value) => handleFilterStatus(value)}
                  defaultValue={filters.filterStatus}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Status Pembayaran">
                      {filters.filterStatus
                        ? statusPayment.find(
                            (product: any) =>
                              product.id === filters.filterStatus
                          )?.name
                        : "Pilih Status Pembayaran"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status Pembayaran</SelectItem>
                    {statusPayment?.map((payment: any) => (
                      <SelectItem key={payment.id} value={payment.id}>
                        {payment.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-56">
                <Select
                  onValueChange={(value) => handleFilterPayment(value)}
                  defaultValue={filters.filterPayment}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Metode Pembayaran">
                      {filters.filterPayment
                        ? payment.find(
                            (product: any) =>
                              product.id === filters.filterPayment
                          )?.name
                        : "Pilih Metode Pembayaran"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Metode Pembayaran</SelectItem>
                    {payment?.map((payment: any) => (
                      <SelectItem key={payment.id} value={payment.id}>
                        {payment.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-56">
                <Select
                  onValueChange={(value) => handleFilterFactory(value)}
                  defaultValue={filters.factory_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Pabrik">
                      {filters.factory_id
                        ? factories.find(
                            (factory: any) =>
                              factory.id === filters.factory_id
                          )?.name
                        : "Pilih Pabrik"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Pabrik</SelectItem>
                    {factories?.map((factory: any) => (
                      <SelectItem key={factory.id} value={factory.id}>
                        {factory.name}
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
          {loadingSearch ? (
            <div className="flex justify-center items-center h-24">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <DataTable
              columns={columns(fetchData, pagination.page, pagination.limit)}
              data={data}
              pagination={pagination}
              sorting={(sortBy, sortOrder) => {
                setFilters((prev) => ({ ...prev, sortBy, sortOrder }));
              }}
              onPageChange={handlePageChange}
              onPageSizeChange={(size) => {
                setPagination((prev) => ({ ...prev, limit: size, page: 1 }));
              }}
            />
          )}
        </Card>
      )}
    </MainPage>
  );
}
