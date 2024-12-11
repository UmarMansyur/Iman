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
import { Badge } from "@/components/ui/badge";

export const columns = (fetchData: () => Promise<void>, page: number, limit: number, options: { products: Product[], units: Unit[] }): ColumnDef<ProductUnit>[] => [
  {
    id: "index",
    header: "No",
    cell: ({ row }) => (page - 1) * limit + row.index + 1,
  },
  {
    accessorKey: "product_satuan",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nama Produk"/>
    ),
  },
  {
    accessorKey: "unit_satuan",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Satuan"/>
    ),
    cell: ({ row }) => {
      const productUnit = row.original as any;
      return productUnit.unit_satuan;
    },
  },
  {
    accessorKey: "price",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Harga Produksi"/>
    ),
    cell: ({ row }) => {
      const priceProductUnit = row.original as any;
      return priceProductUnit.price ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(priceProductUnit.price).slice(0, -3) : "-";
    },
  },
  {
    accessorKey: "sale_price",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Harga Jual"/>
    ),
    cell: ({ row }) => {
      const priceProductUnit = row.original as any;
      return priceProductUnit.sale_price ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(priceProductUnit.sale_price).slice(0, -3) : "-";
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status"/>
    ),
    cell: ({ row }) => {
      const priceProductUnit = row.original as any;
      if (priceProductUnit.status === "Active") {
        return <Badge variant="outline" className="bg-blue-500 text-white hover:bg-blue-600 border-none">Aktif</Badge>;
      } else {
        return <Badge variant="outline" className="bg-red-500 text-white hover:bg-red-600 border-none">Tidak Aktif</Badge>;
      }
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Dibuat"/>
    ),
    cell: ({ row }) => {
      const priceProductUnit = row.original as any;
      return priceProductUnit.created_at ? new Date(priceProductUnit.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : "-";
    },
  },
  {
    accessorKey: "updated_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Diubah"/>
    ),
    cell: ({ row }) => {
      const priceProductUnit = row.original as any;
      return priceProductUnit.updated_at ? new Date(priceProductUnit.updated_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : "-";
    },
  },
  {
    accessorKey: "action",
    header: "Aksi",
    cell: ({ row }) => {
      const priceProductUnit = row.original as any;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="rounded-md p-2 cursor-pointer">
              <MoreHorizontal className="w-4 h-4" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <Form priceProductUnit={priceProductUnit} fetchData={fetchData} options={options} />
            <DeleteButton fetchData={fetchData} endpoint="price-product-unit" id={priceProductUnit.id.toString()} />
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

