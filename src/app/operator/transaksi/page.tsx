/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { useState, useCallback, useMemo, useEffect } from "react";
import { columns } from "./column";
import { DataTable } from "./data-table";
import { Card, CardHeader } from "@/components/ui/card";
import { Loader2, Search } from "lucide-react";
import MainPage from "@/components/main";
import LoaderScreen from "@/components/views/loader";
import { Input } from "@/components/ui/input";
import debounce from "lodash/debounce";
import { useUserStore } from "@/store/user-store";
import { useQuery, useQueryClient } from "@tanstack/react-query";

type TransactionFilters = {
  search: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

type TransactionData = {
  data: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function TransactionPage() {
  const [searchInput, setSearchInput] = useState<string>("");
  const [queryParams, setQueryParams] = useState<TransactionFilters & {
    page: number;
    limit: number;
  }>({
    page: 1,
    limit: 10,
    search: "",
    sortBy: "id",
    sortOrder: "asc",
  });
  const { user } = useUserStore();

  useEffect(() => {
    document.title = "Transaksi Produk - Indera Distribution";
  }, []);

  const fetchTransactions = async (): Promise<TransactionData> => {
    const { page, limit, search, sortBy, sortOrder } = queryParams;
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search,
      sortBy,
      sortOrder,
    });
    if(!user?.factory_selected?.id) {
      return {
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 1,
        },
      };
    }

    params.set("factory_id", user?.factory_selected?.id.toString());

    const response = await fetch(`/api/transaction?${params}`);
    const data = await response.json();
    return data;
  }

  const { data, isLoading, isError, error } = useQuery<TransactionData>({
    queryKey: ["transactions", queryParams],
    queryFn: fetchTransactions,
    placeholderData: (previousData) => previousData,
  });

  // fetch ulang ketika ada usernya
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["transactions", queryParams] });
  }, [user]);

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

  const queryClient = useQueryClient();
  const handleSearchInputChange = useCallback(
    (value: string) => {
      setSearchInput(value);
      debouncedSearch(value);
    },
    [debouncedSearch]
  );

  const handlePageChange = (newPage: number) => {
    setQueryParams((prev) => ({
      ...prev,
      page: newPage + 1,
    }));
  };

  const updateQueryParams = (updates: Partial<typeof queryParams>) => {
    setQueryParams((prev) => ({
      ...prev,
      ...updates,
    }));
    queryClient.invalidateQueries({ queryKey: ["transactions", queryParams] });
  };

  if(isError) {
    return (
      <div>
        Error: {error instanceof Error ? error.message : "An unknown error occurred"}
      </div>
    );
  }

  return (
    <MainPage>
      {isLoading ? (
        <LoaderScreen />
      ) : (
        <Card>
          <CardHeader className="border-b p-4 mb-2">
            <h4 className="text-base font-semibold mb-0">Daftar Transaksi Produk</h4>
            <p className="text-xs text-muted-foreground">
              Transaksi produk yang telah dilakukan dapat dilihat detailnya dengan mengklik tombol detail.
            </p>
          </CardHeader>
          <div className="flex justify-between items-center p-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Cari kode invoice"
                  className="ps-8"
                  onChange={(e) => handleSearchInputChange(e.target.value)}
                  value={searchInput}
                />
              </div>
            </div>
          </div>
          {isLoading ? (
            <div className="flex justify-center items-center h-24">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <DataTable
              columns={columns(queryParams.page, queryParams.limit)}
              data={data?.data || []}
              pagination={data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 }}
              sorting={(sortBy, sortOrder) => {
                updateQueryParams({ sortBy, sortOrder: sortOrder as "asc" | "desc" });
              }}
              onPageChange={handlePageChange}
              onPageSizeChange={(size) => {
                updateQueryParams({ limit: size, page: 1 });
              }}
            />
          )}
        </Card>
      )}
    </MainPage>
  );
}
