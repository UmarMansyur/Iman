"use client"

import { DataTableColumnHeader } from "@/components/data-table-column-header";
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Edit, Pencil, Trash } from "lucide-react";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
// email         String    @unique
// username      String    @unique
// password      String
// gender        Gender
// tanggal_lahir DateTime
// thumbnail     String?
// address       String
export type User = {
  id: string
  email: string
  username: string
  gender: string
  tanggal_lahir: string
  thumbnail: string
  address: string,
  status: string,
}

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "thumbnail",
    header: 'Photo Profile',
    cell: ({ row }) => {
      const username: string = row.getValue("username");
      const initial = username.charAt(0).toUpperCase();
      return <Avatar>
        <AvatarFallback>
          {initial}
        </AvatarFallback>
      </Avatar> 
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
  },
  {
    accessorKey: "username",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Username" />
    ),
  },
  {
    accessorKey: "gender",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Jenis Kelamin" />
    ),
  },
  {
    accessorKey: "tanggal_lahir",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tanggal Lahir" />
    ),
    cell: ({ row }) => {
      return new Date(row.getValue("tanggal_lahir")).toLocaleDateString("id-ID")
    },
  },
  {
    accessorKey: "address",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Alamat" />
    ),
  },
  {
    accessorKey: "status",
    cell: ({ row }) => {
      const status = row.getValue("status")
      if (status === "Aktif") return <Badge className="bg-blue-500 hover:bg-blue-600">Aktif</Badge>
      if (status === "Tidak Aktif") return <Badge className="bg-red-500 hover:bg-red-600">Tidak Aktif</Badge>
    },
  },
  {
    accessorKey: "action",
    header: 'Aksi',
    cell: ({ row }) => {
      // buatkan button edit dan delete
      return <div className="flex items-center gap-2">
        <button type="button" className="text-white hover:text-white bg-yellow-500 hover:bg-yellow-600 rounded-md p-2" onClick={() => console.log(row.original.id)}>
          <Pencil className="w-[10px] h-[10px]" />
        </button>
        <button type="button" className="text-white hover:text-white bg-red-500 hover:bg-red-600 rounded-md p-2" onClick={() => console.log(row.original.id)}>
          <Trash className="w-[10px] h-[10px]" />
        </button>
      </div>
    },
  },
]
