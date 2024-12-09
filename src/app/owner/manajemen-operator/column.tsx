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
import { DropdownOptions, Operator} from "@/lib/definitions";
import Form from "./form";

interface ColumnProps {
  fetchData: () => Promise<void>;
  page: number;
  limit: number;
  searchData: (query: string) => Promise<void>;
  choiced: (value: DropdownOptions) => void;
  keyword: string;
  options: DropdownOptions[];
}

export const columns = ({
  fetchData,
  page,
  limit,
  searchData,
  choiced,
  keyword,
  options,
}: ColumnProps): ColumnDef<Operator>[] => [
  {
    id: "index",
    header: "No",
    cell: ({ row }) => (page - 1) * limit + row.index + 1,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nama Operator"/>
    ),
  },
  {
    accessorKey: "role",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role"/>
    ),
  },
  {
    accessorKey: "action",
    header: "Aksi",
    cell: ({ row }) => {
      const operator = row.original as Operator;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="rounded-md p-2 cursor-pointer">
              <MoreHorizontal className="w-4 h-4" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <Form operator={
              {
                searchData: searchData,
                keyword: keyword,
                choiced: choiced,
                options: options,
              }
            } fetchData={fetchData} />
            <DeleteButton fetchData={fetchData} endpoint="operator" id={operator.id.toString()} />
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

