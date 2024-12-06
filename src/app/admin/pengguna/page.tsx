"use client";

import { useEffect, useState } from "react";
import { columns, User } from "./column";
import { DataPengguna } from "./data-table";
import StatusFilter from "./StatusFilter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, UserCheck, UserCog, Users, UserX } from "lucide-react";
import { useRouter } from "next/navigation";
import MainPage from "@/components/main";

export default function PenggunaPage() {
  const router = useRouter();
  const [data, setData] = useState<User[]>([]);
  const [selectedStatus, setSelectedStatus] = useState("Semua");
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [active, setActive] = useState(0);
  const [verified, setVerified] = useState(0);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/user");
      const { users, total, active, verified } = await response.json();
      setData(users);
      setTotal(total);
      setActive(active);
      setVerified(verified);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = data.filter((user) => {
    if (selectedStatus === "Semua") return true;
    if (selectedStatus === "Belum Verifikasi") return !user.is_verified;
    if (selectedStatus === "Aktif") return user.is_verified && user.is_active;
    if (selectedStatus === "Tidak Aktif")
      return user.is_verified && !user.is_active;
    return true;
  });

  return (
    <MainPage>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500 hover:shadow-sm hover:shadow-blue-500/50 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Pengguna
            </CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 hover:shadow-sm hover:shadow-green-500/50 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pengguna Aktif
            </CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{active}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500 hover:shadow-sm hover:shadow-red-500/50 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pengguna Tidak Aktif
            </CardTitle>
            <UserX className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{verified}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500 hover:shadow-sm hover:shadow-yellow-500/50 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Belum Verifikasi
            </CardTitle>
            <UserCog className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{verified}</div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader className="border-b pt-4 pb-2 mb-2">
          <h1 className="text-lg font-semibold">Daftar Pengguna</h1>
          <p className="text-sm text-muted-foreground">
            Daftar pengguna sistem yang terdaftar. Untuk mengubah data pengguna, klik icon <span className="font-bold">pencil</span> pada baris yang diinginkan. Pastikan untuk mengubah data yang sesuai dengan data pengguna.
          </p>
        </CardHeader>
        <div className="flex justify-between items-center mb-4 p-4">
          <StatusFilter
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
          />
          <Button
            onClick={() => router.push("/admin/pengguna/create")}
            className="bg-blue-500 hover:bg-blue-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Pengguna
          </Button>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : (
          <DataPengguna columns={columns} data={filteredData} />
        )}
      </Card>
    </MainPage>
  );
}
