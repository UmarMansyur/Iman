/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { useEffect, useState, useCallback } from "react";
import { columns } from "./column";
import { DataTable } from "./data-table";
import { Loader2, Search } from "lucide-react";
import LoaderScreen from "@/components/views/loader";
import { Input } from "@/components/ui/input";
import debounce from "lodash/debounce";
import { useUserStore } from "@/store/user-store";

export default function PabrikPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Tambahkan state baru untuk nilai input search
  const [searchInput, setSearchInput] = useState("");
  const { user } = useUserStore()
  const fetchProducts = async () => {
    try {
      setLoading(true);
      if(!user) return;
      const factoryId = user?.factory_selected?.id;
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search: filters.search,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        type_preorder: "true",
      });

      if(factoryId) {
        queryParams.set("factoryId", factoryId.toString());
      }
  
      const response = await fetch(`/api/order?${queryParams}`);
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

  useEffect(() => {
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
  const [loadingSearch, setLoadingSearch] = useState(false);
  const handleSearch = (value: string) => {
    setSearchInput(value);
    setLoadingSearch(true);
    debouncedSearch(value);
  };

  // Tambahkan handler untuk pagination
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
        <div>
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Cari bahan baku"
                  className="ps-8"
                  onChange={(e) => handleSearch(e.target.value)}
                  value={searchInput}
                />
              </div>
            </div>
          
          </div>
          {loadingSearch ? (
            <div className="flex justify-center items-center h-24">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <DataTable
              columns={columns(fetchProducts, pagination.page, pagination.limit)}
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
        </div>
      )}
    </div>

  );
}
