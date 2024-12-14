/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState, useCallback } from "react";
import { columns } from "./column"
import { DataTable } from "./data-table";
import { Loader2, Search } from "lucide-react";
import LoaderScreen from "@/components/views/loader";
import { Input } from "@/components/ui/input";
import debounce from "lodash/debounce";
import { useUserStore } from "@/store/user-store";
import MainPage from "@/components/main";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Form from './form';

export default function LaporanProduksiPage() {
  const [data, setData] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSearch, setLoadingSearch] = useState(false);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [filters, setFilters] = useState({
    search: "",
    sortBy: "created_at",
    sortOrder: "desc",
  });

  const [searchInput, setSearchInput] = useState("");
  const { user } = useUserStore();

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
      });

      if (factoryId) {
        queryParams.set("factoryId", factoryId.toString());
      }

      const response = await fetch(`/api/laporan-produksi?${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }
      
      const result = await response.json();

      setData(result.data);
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

  const [products, setProducts] = useState<any[]>([]);

  const fetchProducts = async () => {
    const response = await fetch("/api/product?factoryId=" + user?.factory_selected?.id);
    const result = await response.json();
    setProducts(result.products);
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
    user,
  ]);

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setFilters((prev) => ({ ...prev, search: value }));
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 500),
    []
  );


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
                  <h3 className="text-lg font-semibold">
                    Input Laporan Produksi
                  </h3>
                </div>
              </CardTitle>
              <CardDescription>
                Berikut adalah laporan produksi dari masing-masing produk yang dihasilkan. Operator hanya dapat menginput laporan produksi dari produk yang sudah ditentukan oleh owner.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center py-4">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      type="text"
                      placeholder="Cari laporan..."
                      className="pl-8"
                      onChange={(e) => handleSearch(e.target.value)}
                      value={searchInput}
                    />
                  </div>
                </div>
                <div>
                  <Form fetchData={fetchReports} />
                </div>
              </div>
              {loadingSearch ? (
                <div className="flex justify-center items-center h-24">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : (
                <DataTable
                  columns={columns(
                    fetchReports,
                    pagination.page,
                    pagination.limit,
                    products
                  )}
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