/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table-column-header";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import Form from "./form";
import DeleteButtonQuery from "@/components/DeleteButton";

export const columns = (
  page: number,
  limit: number,
): ColumnDef<any>[] => [
  {
    id: "index",
    header: "No",
    cell: ({ row }) => (page - 1) * limit + row.index + 1,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nama Jasa" />
    ),
    cell: ({ row }) => {
      const data = row.original as any;
      return data.name;
    },
  },
  {
    accessorKey: "price",
    header: ({column}) => (
      <DataTableColumnHeader column={column} title="Harga" />
    ),
    cell: ({row}) => {
      const data = row.original as any;
      return data.price ? new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(data.price).slice(0, -3) : "-";
    }
  },
  {
    accessorKey: "action",
    header: "Aksi",
    cell: ({row}) => {
      const data = row.original as any;
      return (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <div className="rounded-md p-2 cursor-pointer">
              <MoreHorizontal className="w-4 h-4" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <Form service={data}/>
            <DeleteButtonQuery endpoint="service" id={data?.id.toString()} queryKey="services" />
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  },
];
