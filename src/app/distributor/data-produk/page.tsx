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
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useMemo, useCallback } from "react";
import { debounce } from "lodash";
import Form from "./form";
import { useQuery } from "@tanstack/react-query";
import LoaderScreen from "@/components/views/loader";
import { useUserStore } from "@/store/user-store";

// Type definitions for better type safety
interface DataProductFilter {
  search: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

interface DataProduct {
  data: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  options: any;
}

export default function LokasiPengirimanPage() {
  // Separate state for local input and query parameters
  const [searchInput, setSearchInput] = useState("");
  const [queryParams, setQueryParams] = useState<
    DataProductFilter & {
      page: number;
      limit: number;
    }
  >({
    page: 1,
    limit: 10,
    search: "",
    sortBy: "id",
    sortOrder: "asc",
  });

  const { user } = useUserStore();

  const fetchDataProduct = async () => {
    const { page, limit, search, sortBy, sortOrder } = queryParams;
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search,
      sortBy,
      sortOrder,
    });
    if (!user?.factory_selected?.id && !user?.id) {
      throw new Error("Invalid user data");
    }

    const response = await fetch(
      `/api/distributor/data-produk/?${params}&factory_id=${user?.factory_selected?.id}&user_id=${user?.id}`
    );
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message);
    }

    return data as DataProduct;
  };

  const { data, isLoading, isError, error } = useQuery<DataProduct>({
    queryKey: ["product-distributor", queryParams],
    queryFn: fetchDataProduct,
    placeholderData: (previousData) => previousData,
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
      page: updates.page ?? prev.page,
    }));
  };

  if (isError) {
    return (
      <div>
        Error:{" "}
        {error instanceof Error ? error.message : "An unknown error occurred"}
      </div>
    );
  }

  return (
    <MainPage>
      <Card>
        <CardHeader>
          <CardTitle>Data Produk</CardTitle>
          <CardDescription>
            Harga berikut dapat berubah jika anda telah mengubah data produk
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Cari produk..."
                  className="pl-8"
                  onChange={(e) => handleSearchInputChange(e.target.value)}
                  value={searchInput}
                />
              </div>
            </div>
            <div>
              <Form products={data?.options} />
            </div>
          </div>
          {isLoading ? (
            <LoaderScreen />
          ) : (
            <DataTable
              columns={columns(
                data?.pagination.page ?? 1,
                data?.pagination.limit ?? 10,
                data?.options
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
          )}
        </CardContent>
      </Card>
    </MainPage>
  );
}
