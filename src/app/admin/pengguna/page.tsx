import MainPage from "@/components/main";
import { DataPengguna } from "./data-table";
import { columns } from "./column";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Users, UserCheck, UserX, UserCog, Search } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function Pengguna() {
  const data = [
    {
      id: "1",
      email: "test@test.com",
      username: "test",
      gender: "Laki-laki",
      tanggal_lahir: "1990-01-01",
      thumbnail: "test.com",
      address: "test",
      status: "Aktif",
    },
  ];

  for (let i = 0; i < 100; i++) {
    data.push({
      id: i.toString(),
      email: `test${i}@test.com`,
      username: `test${i}`,
      gender: "Laki-laki",
      tanggal_lahir: "1990-01-01",
      thumbnail: "test.com",
      address: "test",
      status: "Aktif",
    });
  }

  return (
    <MainPage>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-5">
        <Card className="border-l-4 border-l-blue-500 hover:shadow-sm hover:shadow-blue-500/50 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Pengguna</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">100</div>
            <p className="text-xs text-muted-foreground mt-1">+12% dari bulan lalu</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500 hover:shadow-sm hover:shadow-green-500/50 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pengguna Aktif</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">100</div>
            <p className="text-xs text-muted-foreground mt-1">80% dari total pengguna</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500 hover:shadow-sm hover:shadow-red-500/50 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pengguna Tidak Aktif</CardTitle>
            <UserX className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">100</div>
            <p className="text-xs text-muted-foreground mt-1">15% dari total pengguna</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500 hover:shadow-sm hover:shadow-yellow-500/50 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Belum Verifikasi</CardTitle>
            <UserCog className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">100</div>
            <p className="text-xs text-muted-foreground mt-1">5% dari total pengguna</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <div className="relative w-64">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Cari Pengguna"
            className="w-full pl-8 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-gray-300 focus:border-gray-300"
          />
        </div>
        <Button className="bg-blue-500 hover:bg-blue-600 text-white ms-auto">
          <Plus /> Tambah Pengguna
        </Button>
      </div>
      <div className="flex flex-col w-full mx-0 overflow-x-auto">
        <DataPengguna
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          columns={columns as any}
          data={data}
        />
      </div>
    </MainPage>
  );
}
