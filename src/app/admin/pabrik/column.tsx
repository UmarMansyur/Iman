"use client";

import { DataTableColumnHeader } from "@/components/data-table-column-header";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Pencil, Trash } from "lucide-react";
import { Input } from "@/components/ui/input";

// This type is used to define the shape of our data.
export type Factory = {
  id: string;
  nickname: string;
  name: string;
  logo: string | null;
  address: string;
  status: string;
  // Relations are not included in this view
};

export const columns: ColumnDef<Factory>[] = [
  {
    accessorKey: "logo",
    header: "Logo",
    cell: ({ row }) => {
      const logo = row.getValue("logo");
      return logo ? (
        <Avatar>
          <AvatarFallback>Logo</AvatarFallback>
        </Avatar>
      ) : (
        <Avatar>
          <AvatarFallback>Logo</AvatarFallback>
        </Avatar>
      );
    },
  },
  {
    accessorKey: "nickname",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nickname" />
    ),
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Factory Name" />
    ),
  },
  {
    accessorKey: "address",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Address" />
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status");
      switch (status) {
        case "ACTIVE":
          return <Badge className="bg-green-500">Active</Badge>;
        case "PENDING":
          return <Badge className="bg-yellow-500">Pending</Badge>;
        case "INACTIVE":
          return <Badge className="bg-red-500">Inactive</Badge>;
        case "SUSPENDED":
          return <Badge className="bg-gray-500">Suspended</Badge>;
        default:
          return <Badge className="bg-gray-300">Unknown</Badge>;
      }
    },
  },
  {
    accessorKey: "action",
    header: "Aksi",
    cell: ({ row }) => {
      // buatkan tombol edit dan delete
      return (
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="border bg-transparent hover:bg-gray-50 text-black">
                <Pencil className="h-3 w-3" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Factory</DialogTitle>
                <DialogDescription>
                  Perbarui informasi untuk factory ini.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <Input placeholder="Nickname" />
                <Input placeholder="Name" />
                <Input placeholder="Alamat" />
                <Button className="bg-blue-500 hover:bg-blue-600 text-white w-full mt-4">
                  Perbarui Factory
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog>
        <DialogTrigger asChild>
          <Button size="sm" className="border bg-transparent hover:bg-gray-50 text-black">
            <Trash className="h-3 w-3" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apakah Anda Yakin?</DialogTitle>
            <DialogDescription>
              Aksi ini tidak bisa dibatalkan. Factory ini akan dihapus
              secara permanen dan data terkait akan dihapus dari sistem.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-4 mt-4">
            <Button variant="outline" onClick={() => console.log("Cancelled")}>
              Batal
            </Button>
            <Button className="bg-red-500 hover:bg-red-600 text-white" onClick={() => console.log("Factory deleted")}>
              Hapus
            </Button>
          </div>
        </DialogContent>
      </Dialog>
        </div>
      );
    },
  },
];
