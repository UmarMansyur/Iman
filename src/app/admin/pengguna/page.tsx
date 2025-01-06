/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { useEffect, useState, useCallback } from "react";
import { columns, User } from "./column";
import { DataPengguna } from "./data-table";
import StatusFilter from "./StatusFilter";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import MainPage from "@/components/main";
import LoaderScreen from "@/components/views/loader";
import { Input } from "@/components/ui/input";
import debounce from "lodash/debounce";
import toast from "react-hot-toast";

export default function PenggunaPage() {
  const router = useRouter();

  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [filters, setFilters] = useState({
    search: "",
    status: "Semua",
    sortBy: "created_at",
    sortOrder: "desc",
  });

  // Tambahkan state baru untuk nilai input search
  const [searchInput, setSearchInput] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search: filters.search,
        status: filters.status,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      });

      if (filters.sortBy === "status") {
        queryParams.set("sortBy", "is_active");
      }

      const response = await fetch(`/api/user?${queryParams}`);
      const data = await response.json();

      setData(data.users);
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
    fetchUsers();
  }, [
    pagination.page,
    pagination.limit,
    filters.search,
    filters.status,
    filters.sortBy,
    filters.sortOrder,
  ]);

  const handleFilter = (status: string) => {
    setFilters((prev) => ({ ...prev, status }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

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

  const deleteUser = async (id: number) => {
    const response = await fetch(`/api/user?id=${id}`, {
      method: "DELETE",
    });
    const data = await response.json();
    if (!response.ok) {
      toast.error(data.message);
    } else {
      toast.success(data.message);
    }
    await fetchUsers();
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  return (
    <MainPage>
      {loading ? (
        <LoaderScreen />
      ) : (
        <Card>
          <CardHeader className="border-b p-4 mb-2">
            <h4 className="text-base font-semibold mb-0">Daftar Pengguna</h4>
            <p className="text-xs text-muted-foreground">
              Daftar pengguna sistem yang terdaftar. Untuk mengubah data
              pengguna, klik icon <span className="font-bold">pencil</span> pada
              baris yang diinginkan. Pastikan untuk mengubah data yang sesuai
              dengan data pengguna.
            </p>
          </CardHeader>
          <div className="flex justify-between items-center p-4">
            <div className="flex items-center gap-2">
              <StatusFilter
                selectedStatus={filters.status}
                onStatusChange={handleFilter}
              />
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Cari pengguna"
                  className="ps-8"
                  onChange={(e) => handleSearch(e.target.value)}
                  value={searchInput}
                />
              </div>
            </div>

            <Button
              onClick={() => router.push("/admin/pengguna/create")}
              className="bg-blue-500 hover:bg-blue-500/90 opacity-100"
            >
              <Plus className="w-4 h-4 mr-1" />
              Tambah Pengguna
            </Button>
          </div>
          {loadingSearch ? (
            // buatkan loading pada tabel
            <div className="flex justify-center items-center h-24">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <DataPengguna
              columns={columns(deleteUser)}
              data={data}
              pagination={pagination}
              onPageChange={handlePageChange}
              sorting={(sortBy, sortOrder) => {
                setFilters((prev) => ({ ...prev, sortBy, sortOrder }));
              }}
              onPageSizeChange={(size) => {
                setPagination((prev) => ({ 
                  ...prev, 
                  limit: size, 
                  page: 1 
                }));
              }}
            />
          )}
        </Card>
      )}
    </MainPage>
  );
}
