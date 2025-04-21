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
import { Role, User } from "@prisma/client";
import { DropdownOptions } from "@/lib/definitions";

export default function ManajemenOperatorPage() {
  const [data, setData] = useState<[]>([]);
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

  const [searchInput, setSearchInput] = useState("");

  const { user } = useUserStore()
  const [searchUser] = useState("");
  const [userData, setUserData] = useState<User[]>([]);
  const [roleData, setRoleData] = useState<Role[]>([]);

  const fetchRole = async () => {
    const response = await fetch('/api/role?limit=100');
    const data = await response.json();
    setRoleData(data.roles);
  }

  const fetchMember = async () => {
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
      });

      if(factoryId) {
        queryParams.set("factoryId", factoryId.toString());
      }
  
      const response = await fetch(`/api/operator?${queryParams}`);
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

  const fetchUser = async (query?: string) => {
    const response = await fetch(`/api/user?limit=100&search=${query}`);
    const data = await response.json();
    setUserData(data.users);
  };

  useEffect(() => {
    fetchMember();
    fetchUser(searchUser);
    fetchRole();
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
    debouncedSearch(value);
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({
      ...prev,
      page: newPage + 1,
    }));
  };

  const debouncedFetchUser = useCallback(
    debounce((query: string) => {
      fetchUser(query);
    }, 500),
    []
  );

  const searchUserOperator = async (query: string) => {
    debouncedFetchUser(query);
  };

  const choiced = (value: DropdownOptions) => {
    return value;
  };

  useEffect(() => {
    document.title = "Manajemen Operator - Indera Distribution";
  }, []);

  return (
    <MainPage>
      {loading ? (
        <LoaderScreen />
      ) : (
        <Card>
          <CardHeader className="border-b p-4 mb-2">
            <h4 className="text-base font-semibold mb-0">Daftar Operator</h4>
            <p className="text-xs text-muted-foreground">
              Daftar operator yang terdaftar di pabrik anda.
            </p>
          </CardHeader>
          <div className="flex justify-between items-center p-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Cari operator"
                  className="ps-8"
                  onChange={(e) => handleSearch(e.target.value)}
                  value={searchInput}
                  autoFocus
                />
              </div>
            </div>
            <Form fetchData={fetchMember} operator={{
              searchData: async (query: string) => {
                searchUserOperator(query);
                return Promise.resolve();
              },
              choiced: choiced,
              keyword: filters.search,
              options: userData.map((user) => ({
                label: user.username,
                value: user.id.toString(),
                thumbnail: user.thumbnail || "",
                email: user.email,
              })),
            }} roleData={roleData} />
          </div>
          {loadingSearch ? (
            <div className="flex justify-center items-center h-24">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <DataTable
              columns={columns({
                fetchData: fetchMember,
                page: pagination.page,
                limit: pagination.limit,
                searchData: async (query: string) => {
                  searchUserOperator(query);
                  return Promise.resolve();
                },
                roleData: roleData,
                choiced: choiced,
                keyword: filters.search,
                options: userData.map((user) => ({
                  label: user.username,
                  value: user.id.toString(),
                  thumbnail: user.thumbnail || "",
                  email: user.email,
                })),
              })}
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
