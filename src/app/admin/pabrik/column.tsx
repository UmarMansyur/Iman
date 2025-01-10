"use client";
import { DataTableColumnHeader } from "@/components/data-table-column-header";
import { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreHorizontal } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FactoryTable } from "@/lib/definitions";
import { Badge } from "@/components/ui/badge";
import Form from "./form-edit";
import DeleteButton from "@/components/delete-button";

export const columns = (fetchData: () => Promise<void>, users: { value: string; label: string }[]): ColumnDef<FactoryTable>[] => [
  {
    accessorKey: "logo",
    header: "Logo",
    cell: ({ row }) => {
      return (
        <Avatar className="w-8 h-8">
          {row.original.logo && (
            <AvatarImage src={row.original.logo} />
          )}
          <AvatarFallback>{row.original.nickname.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
      );
    },
  },
  {
    accessorKey: "nickname",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nama Singkat"/>
    ),
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nama Pabrik"/>
    ),

  },
  {
    accessorKey: "address",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Alamat"/>
    ),

  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tanggal Dibuat"/>
    ),
    cell: ({ row }) => {
      return (
        <div>{new Date(row.original.created_at).toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        })}</div>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status"/>
    ),
    cell: ({ row }) => {
      if (row.original.status === "Active") {
        return <Badge className="bg-blue-500 text-white hover:bg-blue-600">Aktif</Badge>;
      }
      if (row.original.status === "Pending") {
        return <Badge className="bg-yellow-500 text-white hover:bg-yellow-600">Pending</Badge>;
      }
      if (row.original.status === "Inactive") {
        return <Badge className="bg-red-500 text-white hover:bg-red-600">Tidak Aktif</Badge>;
      }

      return <Badge className="bg-gray-500 text-white hover:bg-gray-600">Tidak Diketahui</Badge>;
    },
  },
  {
    accessorKey: "action",
    header: "Aksi",
    cell: ({ row }) => {
      const factory = row.original as FactoryTable;
      return (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <div className="rounded-md p-2 cursor-pointer">
              <MoreHorizontal className="w-4 h-4" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <Form factory={factory} fetchData={fetchData} users={users}/>
            {/* <FormMember factory={row.original as FactoryTable} /> */}
            <DeleteButton fetchData={fetchData} endpoint="factory" id={factory.id.toString()} />
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

