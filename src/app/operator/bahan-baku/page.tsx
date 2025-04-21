/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { useEffect, useState, useCallback } from "react";
import { columns } from "./column";
import { Card, CardHeader } from "@/components/ui/card";
import { Loader2, Search } from "lucide-react";
import MainPage from "@/components/main";
import LoaderScreen from "@/components/views/loader";
import { Input } from "@/components/ui/input";
import debounce from "lodash/debounce";
import Form from "./form";
import { useUserStore } from "@/store/user-store";
import { DataTable } from "./data-table";
import { Material, MaterialUnit, Unit } from "@prisma/client";

export default function PabrikPage() {
  const { user } = useUserStore()
  const [data, setData] = useState<MaterialUnit[]>([]);
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
    factory_id: user?.factory_selected?.id,
  });

  const [searchInput, setSearchInput] = useState("");
  const [options, setOptions] = useState<{ materials: Material[], units: Unit[] }>({ materials: [], units: [] });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      if(!user) return;
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search: filters.search,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        factory_id: user?.factory_selected?.id || "",
      });

      const response = await fetch(`/api/material-unit?${queryParams}`);
      const data = await response.json();

      
      if(data.options && 
         Array.isArray(data.options.materials) && 
         Array.isArray(data.options.units)) {
        setOptions({
          materials: data.options.materials,
          units: data.options.units
        });
      }

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
    user?.factory_selected?.id
  ]);

  useEffect(() => {
    document.title = "Bahan Baku - Indera Distribution";
  }, []);


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

  return (
    <MainPage>
      {loading ? (
        <LoaderScreen />
      ) : (
        <Card>
          <CardHeader className="border-b p-4 mb-2">
            <h4 className="text-base font-semibold mb-0">Daftar Bahan Baku</h4>
            <p className="text-xs text-muted-foreground">
              Bahan baku berikut ini merupakan bahan baku yang diinputkan di pabrik anda. Perhatikan bahwa bahan baku yang diinputkan di pabrik anda tidak akan tampil di pabrik lain.
            </p>
          </CardHeader>
          <div className="flex justify-between items-center p-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Cari bahan baku ..."
                  className="ps-8"
                  onChange={(e) => handleSearch(e.target.value)}
                  value={searchInput}
                />
              </div>
            </div>
            <Form fetchData={fetchProducts} options={options} />
          </div>
          {loadingSearch ? (
            <div className="flex justify-center items-center h-24">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <DataTable
              columns={columns(fetchProducts, pagination.page, pagination.limit, options)}
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
