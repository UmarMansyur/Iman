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
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useMemo, useCallback, useEffect } from "react";
import { debounce } from "lodash";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import LoaderScreen from "@/components/views/loader";
import { useUserStore } from "@/store/user-store";

// Type definitions for better type safety
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

export default function PelunasanPage() {
  // Separate state for local input and query parameters
  const [searchInput, setSearchInput] = useState("");
  const [queryParams, setQueryParams] = useState<
    ServiceFilters & {
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

  useEffect(() => {
    document.title = "Pelunasan - Indera Distribution";
  }, []);

  const { user } = useUserStore();

  const fetchServices = async () => {
    const { page, limit, search, sortBy, sortOrder } = queryParams;
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search,
      sortBy,
      sortOrder,
    });

    if (user?.factory_selected?.id) {
      const response = await fetch(
        `/api/transaction-service?${params}&factory_id=${user?.factory_selected?.id}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch services");
      }

      return response.json() as Promise<ServiceData>;
    } else {
      return { data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 1 } };
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

  // Create a memoized debounced search function
  const debouncedSearch = useMemo(
    () =>
      debounce((searchValue: string) => {
        setQueryParams((prev) => ({
          ...prev,
          search: searchValue,
          page: 1, // Reset to first page on new search
        }));
      }, 500),
    []
  );

  // Handle input changes
  const handleSearchInputChange = useCallback(
    (value: string) => {
      // Update local input state immediately
      setSearchInput(value);

      // Trigger debounced search
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

  if (isError)
    return (
      <div>
        Error:{" "}
        {error instanceof Error ? error.message : "An unknown error occurred"}
      </div>
    );

  return (
    <MainPage>
      <Card>
        <CardHeader>
          <CardTitle>Daftar Transaksi Layanan Jasa</CardTitle>
          <CardDescription>
            Daftar transaksi layanan jasa yang tersedia
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Cari layanan jasa..."
                  className="pl-8"
                  onChange={(e) => handleSearchInputChange(e.target.value)}
                  value={searchInput}
                />
              </div>
            </div>
          </div>
          {isLoading ? (
            <LoaderScreen />
          ) : (
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
          )}
        </CardContent>
      </Card>
    </MainPage>
  );
}
