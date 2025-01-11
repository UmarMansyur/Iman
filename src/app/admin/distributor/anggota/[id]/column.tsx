/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table-column-header";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import Form from "./form";
import DeleteButtonQuery from "@/components/DeleteButton";

export const columns = (
  page: number,
  limit: number,
  users: any[],
  distributorId: number | null
): ColumnDef<any>[] => [
  {
    id: "index",
    header: "No",
    cell: ({ row }) => (page - 1) * limit + row.index + 1,
  },
  {
    accessorKey: "username",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nama Anggota" />
    ),
    cell: ({ row }) => {
      const data = row.original as any;
      return data.User?.username;
    },
  },
  {
    accessorKey: "address",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Alamat" />
    ),
    cell: ({ row }) => {
      const data = row.original as any;
      return data.User?.address || "-";
    },
  },
  // gender
  {
    accessorKey: "gender",
    header: "Jenis Kelamin",
    cell: ({ row }) => {
      const data = row.original as any;
      return data.User?.gender == "Male" ? "Laki-laki" : "Perempuan";
    },
  },
  {
    accessorKey: "action",
    header: "Aksi",
    cell: ({ row }) => {
      const data = row.original as any;
      return (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <div className="rounded-md p-2 cursor-pointer">
              <MoreHorizontal className="w-4 h-4" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <Form user={data.User} distributorId={distributorId} users={users} />
            <DeleteButtonQuery
              endpoint="distributor"
              id={data?.id.toString()}
              queryKey="member-distributor"
            />
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
