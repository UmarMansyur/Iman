"use client";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Form from "./form";
import DeleteButton from "@/components/delete-button";
import { DataTableColumnHeader } from "@/components/data-table-column-header";
import { PaymentSetting, Product } from "@/lib/definitions";

export const columns = (fetchData: () => Promise<void>, page: number, limit: number): ColumnDef<PaymentSetting>[] => [
  {
    id: "index",
    header: "No",
    cell: ({ row }) => (page - 1) * limit + row.index + 1,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nama Produk"/>
    ),
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Jenis Produk"/>
    ),
  },
  {
    accessorKey: "price",

    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Harga/Pack"/>
    ),
    cell: ({ row }) => (
      <div className="text-start">
        {row.original.price.toLocaleString("id-ID", { style: "currency", currency: "IDR" }).slice(0, -3)}
      </div>
    ),
  },
  {
    accessorKey: "price_ball",
    header: "Harga/Ball",
    cell: ({ row }) => (
      <div className="text-start">
        {(row.original.price * row.original.per_bal).toLocaleString("id-ID", { style: "currency", currency: "IDR" }).slice(0, -3)}
      </div>
    ),
  },
  {
    accessorKey: "action",
    header: "Aksi",
    cell: ({ row }) => {
      return (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <div className="rounded-md p-2 cursor-pointer">
              <MoreHorizontal className="w-4 h-4" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <Form product={row.original as Product} fetchData={fetchData} />
            <DeleteButton fetchData={fetchData} endpoint="product" id={row.original.id.toString()} />
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

