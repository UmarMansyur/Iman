/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table-column-header";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, User } from "lucide-react";
import Form from "./form";
import DeleteButtonQuery from "@/components/DeleteButton";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const columns = (
  page: number,
  limit: number,
  factories: any[]
): ColumnDef<any>[] => [
  {
    id: "index",
    header: "No",
    cell: ({ row }) => (page - 1) * limit + row.index + 1,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nama Distributor" />
    ),
    cell: ({ row }) => {
      const data = row.original as any;
      return data.name;
    },
  },
  {
    accessorKey: "factory_id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Pabrik" />
    ),
    cell: ({ row }) => {
      const data = row.original as any;
      return data.Factory?.name || "-";
    },
  },
  {
    accessorKey: "anggota",
    header: "Anggota",
    cell: ({ row }) => {
      const data = row.original as any;
      //  buatkan tombol link untuk melihat anggota
      return (
        <Link href={`/admin/distributor/anggota/${data.id}`}>
          <Button size="icon">
            <User className="w-4 h-4" />
          </Button>
        </Link>
      );
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
            <Form distributor={data} factories={factories} />
            <DeleteButtonQuery
              endpoint="distributor"
              id={data?.id.toString()}
              queryKey="distributors"
            />
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
