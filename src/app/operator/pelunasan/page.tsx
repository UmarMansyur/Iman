"use client";
import { useEffect, useState } from "react";
import { columns } from "./column";
import { DataTable } from "./data-table";
import { Card, CardHeader } from "@/components/ui/card";
import { Search } from "lucide-react";
import MainPage from "@/components/main";
import LoaderScreen from "@/components/views/loader";
import { Input } from "@/components/ui/input";
import { useUserStore } from "@/store/user-store";
import { useQuery } from "@tanstack/react-query";

export default function PabrikPage() {
  const [searchInput, setSearchInput] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    document.title = "Pelunasan - Indera Distribution";
  }, []);

  const [filters, setFilters] = useState({
    search: "",
    sortBy: "id",
    sortOrder: "asc",
  });

  const { user } = useUserStore();

  // Menggunakan React Query untuk fetch data
  const { data: queryData, isLoading } = useQuery({
    queryKey: ['transactions', pagination, filters, user?.factory_selected?.id],
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

      if (factoryId) {
        queryParams.set("factory_id", factoryId.toString());
      }

      const response = await fetch(`/api/pelunasan?${queryParams}`);
      const result = await response.json();
      
      setPagination(prev => ({
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
      setFilters(prev => ({ ...prev, search: searchInput }));
      setPagination(prev => ({ ...prev, page: 1 }));
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({
      ...prev,
      page: newPage + 1,
    }));
  };

  return (
    <MainPage>
      {isLoading ? (
        <LoaderScreen />
      ) : (
        <Card>
          <CardHeader className="border-b p-4 mb-2">
            <h4 className="text-base font-semibold mb-0">Konfirmasi Pembayaran</h4>
            <p className="text-xs text-muted-foreground">
              Transaksi pembayaran yang telah dilakukan dapat dilihat detailnya dengan mengklik tombol detail.
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
                  onChange={(e) => setSearchInput(e.target.value)}
                  value={searchInput}
                />
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
