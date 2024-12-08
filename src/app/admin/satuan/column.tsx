"use client";
import { DataTableColumnHeader } from "@/components/data-table-column-header";
import { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreHorizontal, Settings } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Form from "./form-edit";
import DeleteButton from "@/components/delete-button";
import { Unit } from "@prisma/client";

export const columns = (fetchData: () => Promise<void>): ColumnDef<Unit>[] => [
  {
    accessorKey: "name",
    header: "Nama",
  },
  {
    accessorKey: "delete",
    header: "Aksi",
    cell: ({ row }) => {
      const unit = row.original as Unit;
      return (
        <DropdownMenu>
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

