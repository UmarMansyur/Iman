"use client";

import MainPage from "@/components/main"; // Mengubah menjadi DataFactory untuk sesuai dengan model
import { columns } from "./column";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Search,
} from "lucide-react";
import StatusFilter from "./StatusFilter";
import { useState } from "react";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DataFactory } from "./data-table";

export default function FactoryPage() {
  const data = [
    {
      id: "1",
      nickname: "Factory 1",
      name: "Factory 1 Name",
      logo: "test-logo.com",  // Logo contoh
      address: "123 Factory Street",
      status: "ACTIVE",
    },
  ];

  for (let i = 0; i < 100; i++) {
    data.push({
      id: i.toString(),
      nickname: `Factory ${i}`,
      name: `Factory ${i} Name`,
      logo: "test-logo.com",  // Logo contoh
      address: `Address ${i}`,
      status: "ACTIVE",
    });
  }

  const [selectedStatus, setSelectedStatus] = useState("ACTIVE");

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
  };

  return (
    <MainPage>
      <div className="flex items-center gap-2">
        <div className="relative w-64">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Cari Factory"
            className="w-full pl-8 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-gray-300 focus:border-gray-300"
          />
        </div>
        <div>
          <StatusFilter selectedStatus={selectedStatus} onStatusChange={handleStatusChange} />
        </div>
        <div className="flex items-center gap-2 ml-auto">
        <Dialog>
        <DialogTrigger asChild>
          <Button className="bg-blue-500 hover:bg-blue-600 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Tambah Factory
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Factory Baru</DialogTitle>
            <DialogDescription>
              Masukkan informasi untuk factory baru.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <Input placeholder="Nickname" />
            <Input placeholder="Name" />
            <Input placeholder="Alamat" />
            <Button className="bg-blue-500 hover:bg-blue-600 text-white w-full mt-4">
              Simpan Factory
            </Button>
          </div>
        </DialogContent>
      </Dialog>
        </div>
      </div>

      <div className="flex flex-col w-full mx-0 overflow-x-auto mt-2">
        <DataFactory
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          columns={columns as any}
          data={data}
        />
      </div>
    </MainPage>
  );
}
