/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState, useCallback } from "react";
import { columns } from "./column";
import { DataTable } from "./data-table";
import { CalendarIcon, FileText, Loader2, Search, Sheet } from "lucide-react";
import LoaderScreen from "@/components/views/loader";
import { Input } from "@/components/ui/input";
import debounce from "lodash/debounce";
import { useUserStore } from "@/store/user-store";
import MainPage from "@/components/main";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Select } from "@radix-ui/react-select";
import {
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
import { cn, formatDateIndonesia } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import InformationCard from "./components/InformationCard";

export default function LaporanProduksiPage() {
  const [data, setData] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSearch, setLoadingSearch] = useState(false);

  useEffect(() => {
    document.title = "Laporan Produksi - Indera Distribution";
  }, []);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [date, setDate] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });

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
        setDate(newDate);
      }
    }

    setFilters((prev) => ({
      ...prev,
      startDate: newDate?.from?.toISOString() || "",
      endDate: newDate?.to?.toISOString() || "",
    }));

    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const [filters, setFilters] = useState({
    search: "",
    sortBy: "created_at",
    sortOrder: "desc",
    filterProduct: "",
    startDate: "",
    endDate: "",
  });

  const [products, setProducts] = useState<any>([]);

  const [searchInput, setSearchInput] = useState("");
  const { user } = useUserStore();
  const [totalProduksi, setTotalProduksi] = useState({
    total_produksi_bulan: 0,
    total_produksi_minggu: 0,
    total_produksi_hari: 0,
  });

  const fetchReports = async () => {
    try {
      setLoading(true);
      if (!user) return;
      const factoryId = user?.factory_selected?.id;
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search: filters.search,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        filterProduct: filters.filterProduct,
        startDate: filters.startDate,
        endDate: filters.endDate,
      });

      if (factoryId) {
        queryParams.set("factoryId", factoryId.toString());
      }

      const response = await fetch(`/api/laporan-produksi?${queryParams}`);
      if (!response.ok) {
        throw new Error("Failed to fetch reports");
      }

      const result = await response.json();

      // cari hari terakhir

      setData(result.data);
      if(result.total_produksi_bulan){
        setTotalProduksi({
          total_produksi_bulan: result.total_produksi_bulan,
          total_produksi_minggu: result.total_produksi_minggu,
          total_produksi_hari: result.total_produksi_hari,
        });
      }
      setPagination((prev) => ({
        ...prev,
        total: result.pagination.total,
        totalPages: result.pagination.totalPages,
      }));
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
      setLoadingSearch(false);
    }
  };

  useEffect(() => {
    fetchReports();
    fetchProducts();
  }, [
    pagination.page,
    pagination.limit,
    filters.search,
    filters.sortBy,
    filters.sortOrder,
    filters.filterProduct,
    filters.endDate,
    user,
  ]);

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setFilters((prev) => ({ ...prev, search: value }));
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 500),
    []
  );

  const fetchProducts = async () => {
    if (!user) return;
    if(products?.length === 0){
    const response = await fetch(
      "/api/product?limit=1000&factoryId=" + user?.factory_selected?.id
    );
    const result = await response.json();
    setProducts(result.products);
  }
  };

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

  const handleFilterProduct = (value: string) => {
    setFilters((prev) => ({ ...prev, filterProduct: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleDownloadExcel = () => {
    const queryParams = new URLSearchParams({
      download: 'excel',
      factoryId: user?.factory_selected?.id.toString() || '',
      startDate: filters.startDate,
      endDate: filters.endDate,
      search: filters.search,
      filterProduct: filters.filterProduct, 
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
      page: pagination.page.toString(),
      limit: pagination.limit.toString(),
    });
    window.open(`/api/laporan-produksi/excel?${queryParams}`, '_blank');
  };

  const handleDownloadPDF = () => {
    const queryParams = new URLSearchParams({
      download: 'pdf',
      factoryId: user?.factory_selected?.id.toString() || '',
      startDate: filters.startDate,
      endDate: filters.endDate,
      search: filters.search,
      filterProduct: filters.filterProduct, 
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
      page: pagination.page.toString(),
      limit: pagination.limit.toString(),
    });
    window.open(`/api/laporan-produksi/pdf?${queryParams}`, '_blank');
  };

  return (
    <div>
      {loading ? (
        <LoaderScreen />
      ) : (
        <MainPage>
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Laporan Produksi Produk</h3>
                </div>
              </CardTitle>
              <CardDescription>
                Laporan ini menampilkan data produksi per shift
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-5">
               <InformationCard data={totalProduksi} />
              </div>

              <div className="flex justify-between items-center pb-4">
                <div className="flex items-center gap-2 w-full">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      type="text"
                      placeholder="Cari Produk..."
                      className="pl-8"
                      onChange={(e) => handleSearch(e.target.value)}
                      value={searchInput}
                    />
                  </div>
                  <div className="w-56">
                    <Select
                      onValueChange={(value) => handleFilterProduct(value)}
                      defaultValue={filters.filterProduct}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Produk">
                          {filters.filterProduct
                            ? products.find(
                                (product: any) =>
                                  product.id === filters.filterProduct
                              )?.name
                            : "Pilih Produk"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {products?.map((product: any) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} ({product.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                  <div className="ml-auto flex items-center gap-2">
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
              {loadingSearch ? (
                <div className="flex justify-center items-center h-24">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : (
                <DataTable
                  columns={columns(fetchReports, pagination.page, pagination.limit)}
                  data={data}
                  pagination={pagination}
                  sorting={(sortBy, sortOrder) => {
                    setFilters((prev) => ({ ...prev, sortBy, sortOrder }));
                  }}
                  onPageChange={handlePageChange}
                  onPageSizeChange={(size) => {
                    setPagination((prev) => ({
                      ...prev,
                      limit: size,
                      page: 1,
                    }));
                  }}
                />
              )}
            </CardContent>
          </Card>
        </MainPage>
      )}
    </div>
  );
}
