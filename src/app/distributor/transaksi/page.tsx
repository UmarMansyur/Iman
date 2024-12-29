/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback, useMemo } from "react";
import { Card, CardHeader } from "@/components/ui/card";
import { PlusCircle, Search } from "lucide-react";
import MainPage from "@/components/main";
import LoaderScreen from "@/components/views/loader";
import { Input } from "@/components/ui/input";
import debounce from "lodash/debounce";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { useUserStore } from "@/store/user-store";

type TransactionFilters = {
  search: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
};

type TransactionData = {
  data: {
    id: number;
    [key: string]: any;
  }[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
export default function TransaksiDistributorPage() {
  const { user } = useUserStore();
  const [searchInput, setSearchInput] = useState<string>("");
  const [queryParams, setQueryParams] = useState<
    TransactionFilters & {
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

  // Fetch Transaksi
  const fetchTransaksi = async (): Promise<TransactionData> => {
    try {
      const { page, limit, search, sortBy, sortOrder } = queryParams;

      if (user?.id && user?.factory_selected?.id) {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          search,
          sortBy,
          sortOrder,
        });

        params.set("distributor_id", user.id.toString());
        params.set("factory_id", user.factory_selected.id.toString());
        const response = await fetch(`/api/distributor/transaksi?${params}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      }

      // Mengembalikan data kosong jika user atau factory tidak ada
      return {
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      };
    } catch (error) {
      console.error("Error fetching transactions:", error);
      throw new Error("Gagal mengambil data transaksi");
    }
  };

  // Fetch Stock Data
  const fetchStockData = async (): Promise<any> => {
    try {
      if (user?.id && user?.factory_selected?.id) {
        const response = await fetch(
          `/api/distributor/data-stock?distributor_id=${user.id}&factory_id=${user.factory_selected.id}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      }
      // Menambahkan return default ketika user atau factory tidak ada
      return {
        summary: {
          totalStockIn: 0,
          availableStock: 0,
          totalStockOut: 0,
          totalProducts: 0,
        },
      };
    } catch (error) {
      console.error("Error fetching stock data:", error);
      throw new Error("Gagal mengambil data stock");
    }
  };

  const { data: transaksiData, isLoading: isLoadingTransaksi } =
    useQuery<TransactionData>({
      queryKey: ["transaksi-distributor", queryParams, user?.id, user?.factory_selected?.id],
      queryFn: fetchTransaksi,
      enabled: !!user?.id && !!user?.factory_selected?.id,
    });

  const { data: stockData, isLoading: isLoadingStock } = useQuery({
    queryKey: ["stock-distributor", user?.id, user?.factory_selected?.id],
    queryFn: fetchStockData,
    enabled: !!user?.id && !!user?.factory_selected?.id,
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
    }));
  };

  if (isLoadingTransaksi || isLoadingStock) {
    return <LoaderScreen />;
  }

  return (
    <MainPage>
      <div className="space-y-4">
        {/* Stock Summary Card */}
        <Card>
          <CardHeader className="border-b p-4">
            <h4 className="text-base font-semibold">Ringkasan Stok</h4>
          </CardHeader>
          <div className="p-4 grid grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-600">Total Stok Masuk</p>
              <p className="text-2xl font-bold">
                {stockData?.summary?.totalStockIn || 0}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-600">Total Stok Tersedia</p>
              <p className="text-2xl font-bold">
                {stockData?.summary?.availableStock || 0}
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm text-red-600">Total Stok Keluar</p>
              <p className="text-2xl font-bold">
                {stockData?.summary?.totalStockOut || 0}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-purple-600">Total Produk</p>
              <p className="text-2xl font-bold">
                {stockData?.summary?.totalProducts || 0}
              </p>
            </div>
          </div>
        </Card>

        {/* Transaction Table Card */}
        <Card>
          <CardHeader className="border-b p-4">
            <h4 className="text-base font-semibold mb-0">
              Transaksi Distributor
            </h4>
            <p className="text-xs text-muted-foreground">
              Kelola semua transaksi distributor Anda di sini
            </p>
          </CardHeader>

          <div className="flex justify-between items-center p-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Cari transaksi..."
                  className="ps-8"
                  onChange={(e) => handleSearchInputChange(e.target.value)}
                  value={searchInput}
                />
              </div>
            </div>
            <Link href="/distributor/transaksi/create">
              <Button className="flex items-center gap-2">
                <PlusCircle className="w-4 h-4" />
                Tambah Transaksi
              </Button>
            </Link>
          </div>
          <div className="p-4">
            <DataTable
              columns={columns}
              data={transaksiData?.data || []}
              pagination={
                transaksiData?.pagination || {
                  page: 1,
                  limit: 10,
                  total: 0,
                  totalPages: 1,
                }
              }
              sorting={(sortBy, sortOrder) => {
                updateQueryParams({
                  sortBy,
                  sortOrder: sortOrder as "asc" | "desc",
                });
              }}
              onPageChange={(page) => {
                updateQueryParams({ page });
              }}
              onPageSizeChange={(size) => {
                updateQueryParams({ limit: size, page: 1 });
              }}
            />
          </div>
        </Card>
      </div>
    </MainPage>
  );
}
