/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import moment from "moment";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DeleteButton from "@/components/delete-button";
import { DataTableColumnHeader } from "@/components/data-table-column-header";
import { MaterialUnit } from "@/lib/definitions";
import { Badge } from "@/components/ui/badge";

export const columns = (fetchData: () => Promise<void>, page: number, limit: number): ColumnDef<MaterialUnit>[] => [
  {
    id: "index",
    header: "No",
    cell: ({ row }) => (page - 1) * limit + row.index + 1,
  },
  {
    accessorKey: "material_unit",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Bahan Baku"/>
    ),
    cell: ({ row }) => {
      const materialStock = row.original as any;
      return materialStock.material_unit?.material?.name || "-";
    },
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Jumlah"/>
    ),
    cell: ({ row }) => {
      const materialStock = row.original as any;
      const amount = materialStock.amount_morning || materialStock.amount_afternoon || 0;
      return `${amount} ${materialStock.material_unit?.unit?.name || ''}`;
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status"/>
    ),
    cell: ({ row }) => {
      const materialStock = row.original as any;
      if (materialStock.status === "in") {
        return <Badge variant="outline" className="bg-blue-500 text-white hover:bg-blue-600 border-none">Masuk</Badge>;
      } else {
        return <Badge variant="outline" className="bg-red-500 text-white hover:bg-red-600 border-none">Keluar</Badge>;
      }
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Dibuat"/>
    ),
    cell: ({ row }) => {
      const materialStock = row.original as any;
      return materialStock.created_at ? new Date(materialStock.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : "-";
    },
  },
  {
    accessorKey: "updated_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Diubah"/>
    ),
    cell: ({ row }) => {
      const materialStock = row.original as any;
      return materialStock.updated_at ? new Date(materialStock.updated_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : "-";
    },
  },
  {
    accessorKey: "action",
    header: "Aksi",
    cell: ({ row }) => {
      const materialStock = row.original as any;
      const isWithinTwoDays = moment().diff(moment(materialStock.created_at), 'days') < 2;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="rounded-md p-2 cursor-pointer">
              <MoreHorizontal className="w-4 h-4" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {/* <DropdownMenuItem asChild>
              <Form fetchData={fetchData} options={options} />
            </DropdownMenuItem> */}
            {isWithinTwoDays && (
              <DeleteButton 
                fetchData={fetchData} 
                endpoint="material-stock" 
                id={materialStock.id.toString()} 
              />
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

