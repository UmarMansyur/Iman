"use client"

import { DataTableColumnHeader } from "@/components/data-table-column-header";
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge";
import { colorStatus } from "@/lib/utils";
import { cn } from "@/lib/utils";

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
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      let status = row.getValue("status")
      if (status === "Aktif") return <Badge className="bg-green-500">Aktif</Badge>
      if (status === "Tidak Aktif") return <Badge className="bg-red-500">Tidak Aktif</Badge>

    },
  },
]
