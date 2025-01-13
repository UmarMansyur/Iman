/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { Card, CardHeader } from "@/components/ui/card";
import MainPage from "@/components/main";
import LoaderScreen from "@/components/views/loader";
import { Input } from "@/components/ui/input";
import debounce from "lodash/debounce";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { useUserStore } from "@/store/user-store";
import { Search } from "lucide-react";

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

  useEffect(() => {
    document.title = "Pengiriman Pembayaran - Indera Distribution";
  }, []);

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

  const { data: transaksiData, isLoading: isLoadingTransaksi } =
    useQuery<TransactionData>({
      queryKey: ["transaksi-distributor", queryParams, user?.id, user?.factory_selected?.id],
      queryFn: fetchTransaksi,
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

  const [products, setProducts] = useState<any[]>([]);

  const fetchProduct = async () => {
    const response = await fetch("/api/product?limit=1000&page=1&factory_id=" + user?.factory_selected?.id);
    const data = await response.json();
    setProducts(data.products);
  }

  const [metodePembayaran, setMetodePembayaran] = useState<any[]>([]);

  const fetchMetodePembayaran = async () => {
    const response = await fetch("/api/payment?limit=1000");
    const data = await response.json();
    setMetodePembayaran(data.payments);
  }

  useEffect(() => {
    fetchProduct();
    fetchMetodePembayaran();
  }, [user?.factory_selected?.id]);


  if (isLoadingTransaksi) {
    return <LoaderScreen />;
  }

  return (
    <MainPage>
      <div className="space-y-4">
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
                  placeholder="Masukkan kode invoice"
                  className="ps-8"
                  onChange={(e) => handleSearchInputChange(e.target.value)}
                  value={searchInput}
                />
              </div>
            </div>
          </div>
          <div className="p-4">
            <DataTable
              columns={columns(products, metodePembayaran)}
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
