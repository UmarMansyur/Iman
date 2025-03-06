/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { useEffect, useState, useCallback } from "react";
import { columns } from "./column";
import { BoxSelect, EthernetPort, Loader2, Search } from "lucide-react";
import MainPage from "@/components/main";
import LoaderScreen from "@/components/views/loader";
import { Input } from "@/components/ui/input";
import debounce from "lodash/debounce";
import Form from "./form";
import { useUserStore } from "@/store/user-store";
import { DataTable } from "./data-table";
import { MaterialUnit, Unit } from "@prisma/client";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PabrikPage() {
  const { user } = useUserStore()
  const [data, setData] = useState<MaterialUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    total_satuan: 0,
  });

  const [filters, setFilters] = useState({
    search: "",
    sortBy: "id",
    sortOrder: "asc",
    factory_id: user?.factory_selected?.id,
  });

  const [searchInput, setSearchInput] = useState("");
  const [options, setOptions] = useState<{ units: Unit[] }>({ units: [] });

  const fetchMaterial = async () => {
    try {
      setLoading(true);
      if (!user) return;
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search: filters.search,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        user_id: user?.id || "",
      });

      const response = await fetch(`/api/distributor/bahan-baku?${queryParams}`);
      const data = await response.json();

      if (data.options &&
        Array.isArray(data.options.units)) {
        setOptions({
          units: data.options.units
        });
      }

      setData(data.data);

      setPagination((prev) => ({
        ...prev,
        total: data.pagination.total,
        total_satuan: data.pagination.total_satuan,
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
    fetchMaterial();
  }, [
    pagination.page,
    pagination.limit,
    filters.search,
    filters.sortBy,
    filters.sortOrder,
    user?.id
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
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 justify-between">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/distributor/bahan-baku">Bahan Baku</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Daftar Bahan Baku</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="grid sm:grid-cols-2 grid-cols-1 gap-10">
            <div className="col-span-1">
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className="text-xl font-bold">
                    Total Bahan Baku
                  </CardTitle>
                  <div className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white p-2 rounded-md">
                    <BoxSelect className="w-4 h-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='text-3xl font-bold'>{pagination.total}</div>
                </CardContent>
              </Card>
            </div>
            <div className="col-span-1">
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-xl font-bold'>
                    Total Satuan
                  </CardTitle>
                  <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-2 rounded-md">
                    <EthernetPort className="w-4 h-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='text-3xl font-bold'>{pagination.total_satuan}</div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Cari bahan baku ..."
                  className="ps-8 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  onChange={(e) => handleSearch(e.target.value)}
                  value={searchInput}
                />
              </div>
            </div>
            <Form fetchData={fetchMaterial} options={options} />
          </div>
          {loadingSearch ? (
            <div className="flex justify-center items-center h-24">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <DataTable
              columns={columns(fetchMaterial, pagination.page, pagination.limit, options)}
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
    </MainPage>
  );
}
