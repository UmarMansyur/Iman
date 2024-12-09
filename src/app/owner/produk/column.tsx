"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Settings } from "lucide-react";

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
    accessorKey: "action",
    header: "Aksi",
    cell: ({ row }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="rounded-md p-2 cursor-pointer">
              <Settings className="w-4 h-4" />
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

