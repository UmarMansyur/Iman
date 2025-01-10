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
import { Unit } from "@prisma/client";
import { DataTableColumnHeader } from "@/components/data-table-column-header";

export const columns = (fetchData: () => Promise<void>, page: number, limit: number): ColumnDef<Unit>[] => [
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
      const unit = row.original as Unit;
      return (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <div className="rounded-md p-2 cursor-pointer">
              <Settings className="w-4 h-4" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <Form unit={unit} fetchData={fetchData} />
            <DeleteButton fetchData={fetchData} endpoint="unit" id={unit.id.toString()} />
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

