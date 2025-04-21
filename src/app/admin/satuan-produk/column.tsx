/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DeleteButton from "@/components/delete-button";
import { DataTableColumnHeader } from "@/components/data-table-column-header";
import { ProductUnit} from "@/lib/definitions";
import { Product, Unit } from "@prisma/client";
import Form from "./form";

export const columns = (fetchData: () => Promise<void>, page: number, limit: number, options: { products: Product[], units: Unit[] }): ColumnDef<ProductUnit>[] => [
  {
    id: "index",
    header: "No",
    cell: ({ row }) => (page - 1) * limit + row.index + 1,
  },
  {
    accessorKey: "product",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nama Produk"/>
    ),
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Jumlah"/>
    ),
    cell: ({ row }) => {
      const productUnit = row.original as any;
      // return productUnit.amount.toString(); split by 3 digit
      return productUnit.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
  },
  {
    accessorKey: "unit",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Satuan"/>
    ),
  },
  {
    accessorKey: "convert_from_parent",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Jumlah Konversi"/>
    ),
  },
  {
    accessorKey: "parent",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Satuan Pokok"/>
    ),
    cell: ({ row }) => {
      const productUnit = row.original as any;
      return productUnit.parent?.name || "-";
    },
  },
  {
    accessorKey: "action",
    header: "Aksi",
    cell: ({ row }) => {
      const productUnit = row.original as ProductUnit;
      return (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <div className="rounded-md p-2 cursor-pointer">
              <MoreHorizontal className="w-4 h-4" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <Form productUnit={productUnit} fetchData={fetchData} options={options} />
            <DeleteButton fetchData={fetchData} endpoint="product-unit" id={productUnit.id.toString()} />
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

