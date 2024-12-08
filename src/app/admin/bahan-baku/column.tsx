"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Settings } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Form from "./form-edit";
import DeleteButton from "@/components/delete-button";
import { Material } from "@/lib/definitions";
import { DataTableColumnHeader } from "@/components/data-table-column-header";

export const columns = (fetchData: () => Promise<void>, page: number, limit: number): ColumnDef<Material>[] => [
  {
    id: "index",
    header: "No",
    cell: ({ row }) => (page - 1) * limit + row.index + 1,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nama"/>
    ),
  },
  {
    accessorKey: "delete",
    header: "Aksi",
    cell: ({ row }) => {
      const material = row.original as Material;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="rounded-md p-2 cursor-pointer">
              <Settings className="w-4 h-4" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <Form material={material} fetchData={fetchData} />
            <DeleteButton fetchData={fetchData} endpoint="material" id={material.id.toString()} />
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

