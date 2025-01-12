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
  products: any,
  factory: any
): ColumnDef<any>[] => [
  {
    id: "index",
    header: "No",
    cell: ({ row }) => (page - 1) * limit + row.index + 1,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nama Produk" />
    ),
    cell: ({ row }) => {
      const data = row.original as any;
      return data.name;
    },
  },
  {
    accessorKey: "factory",
    header: ({column}) => (
      <DataTableColumnHeader column={column} title="Nama Pabrik" />
    ),
    cell: ({row}) => {
      const data = row.original as any;
      return data.factory?.name || "Non Pabrik";
    }
  },
  {
    accessorKey: "price",
    header: ({column}) => (
      <DataTableColumnHeader column={column} title="Harga Pabrik" />
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
    accessorKey: "sale_price",
    header: ({column}) => (
      <DataTableColumnHeader column={column} title="Harga Jual" />
    ),
    cell: ({row}) => {
      const data = row.original as any;
      return data.sale_price ? new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(data.sale_price).slice(0, -3) : "-";
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
            <Form data={data} products={products} factory={factory}/>
            <DeleteButtonQuery endpoint="distributor/data-produk" id={data?.id.toString()} queryKey="product-distributor" />
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  },
];
