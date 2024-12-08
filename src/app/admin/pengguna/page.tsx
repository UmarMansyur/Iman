"use client";
import { useEffect, useState } from "react";
import { columns, User } from "./column";
import { DataPengguna } from "./data-table";
import StatusFilter from "./StatusFilter";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import MainPage from "@/components/main";
import LoaderScreen from "@/components/views/loader";
import { Input } from "@/components/ui/input";

export default function PenggunaPage() {
  const router = useRouter();
  const [data, setData] = useState<User[]>([]);
  const [selectedStatus, setSelectedStatus] = useState("Semua");
  const [filteredData, setFilteredData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${process.env.BASE_URL}/api/user`);
        const users = await response.json();
        if (users) {
          setData(users.users);
          setFilteredData(users.users);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleFilter = (status: string) => {
    setSelectedStatus(status);
    setFilteredData(data.filter((user) => {
      if (status === "Semua") return true;
      if (status === "Belum Verifikasi") return !user.is_verified;
      if (status === "Aktif") return user.is_verified && user.is_active;
      if (status === "Tidak Aktif") return user.is_verified && !user.is_active;
      return true;
    }));
  };

  const searchData = (value: string) => {
    setFilteredData(data.filter((user) =>
      user.username.toLowerCase().includes(value.toLowerCase())
    ));
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
                selectedStatus={selectedStatus}
                onStatusChange={handleFilter}
              />
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Cari pengguna"
                  className="ps-8"
                  onChange={(e) => searchData(e.target.value)}
                />
              </div>
            </div>

            <Button
              onClick={() => router.push("/admin/pengguna/create")}
              className="bg-blue-500 hover:bg-blue-500/90 opacity-100"
            >
              <Plus className="w-4 h-4 mr-2" />
              Tambah Pengguna
            </Button>
          </div>
          <DataPengguna columns={columns} data={filteredData} />
        </Card>
      )}
    </MainPage>
  );
}
