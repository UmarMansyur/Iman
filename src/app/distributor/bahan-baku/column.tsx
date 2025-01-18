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
import { MaterialUnit} from "@/lib/definitions";
import { Unit } from "@prisma/client";
import Form from "./form";

export const columns = (fetchData: () => Promise<void>, page: number, limit: number, options: { units: Unit[] }): ColumnDef<any>[] => [
  {
    id: "index",
    header: "No",
    cell: ({ row }) => (page - 1) * limit + row.index + 1,
  },
  {
    accessorKey: "material_id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Bahan Baku"/>
    ),
    cell: ({ row }) => {
      const materialUnit = row.original;
      return materialUnit.name;
    },
  },
  {
    accessorKey: "unit_id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Satuan"/>
    ),
    cell: ({ row }) => {
      const materialUnit = row.original as MaterialUnit;
      const unit = options.units.find(unit => unit.id === materialUnit.unit_id);
      return unit ? unit.name : "";
    },
  },
  {
    accessorKey: "action",
    header: "Aksi",
    cell: ({ row }) => {
      const materialUnit = row.original as MaterialUnit;
      return (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <div className="rounded-md p-2 cursor-pointer">
              <MoreHorizontal className="w-4 h-4" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <Form materialUnit={materialUnit} fetchData={fetchData} options={options} />
            <DeleteButton fetchData={fetchData} endpoint="distributor/bahan-baku" id={materialUnit.id.toString()} />
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

