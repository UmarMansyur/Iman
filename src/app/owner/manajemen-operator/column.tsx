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
import { DropdownUser, Operator } from "@/lib/definitions";
import Form from "./form";
import { Role } from "@prisma/client";
import { Badge } from "@/components/ui/badge";

interface ColumnProps {
  fetchData: () => Promise<void>;
  page: number;
  limit: number;
  searchData: (query: string) => Promise<void>;
  choiced: (value: DropdownUser) => void;
  keyword: string;
  options: DropdownUser[];
  roleData: Role[];
}

export const columns = ({
  fetchData,
  page,
  limit,
  searchData,
  choiced,
  keyword,
  options,
  roleData,
}: ColumnProps): ColumnDef<Operator>[] => [
  {
    id: "index",
    header: "No",
    cell: ({ row }) => (page - 1) * limit + row.index + 1 + ".",
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nama Operator" />
    ),
  },
  {
    accessorKey: "role",
    header: "Role",
  },
  {
    accessorKey: "gender",
    header: "Jenis Kelamin",
    cell: ({ row }) => {
      const operator = row.original as any;
      return operator.gender === "Male" ? "Laki-laki" : "Perempuan";
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const operator = row.original as Operator;
      if (operator.status === "Active") {
        return (
          <Badge className="bg-blue-500 text-white hover:bg-blue-600">
            Aktif
          </Badge>
        );
      }
      if (operator.status === "Inactive") {
        return (
          <Badge className="bg-red-500 text-white hover:bg-red-600">
            Tidak Aktif
          </Badge>
        );
      }
      return (
        <Badge className="bg-yellow-500 text-white hover:bg-yellow-600">
          Pending
        </Badge>
      );
    },
  },
  {
    accessorKey: "action",
    header: "Aksi",
    cell: ({ row }) => {
      const operator = row.original as Operator;
      return (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <div className="rounded-md p-2 cursor-pointer">
              <MoreHorizontal className="w-4 h-4" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <Form
              operator={{
                searchData: searchData,
                keyword: keyword,
                choiced: choiced,
                options: options,
              }}
              fetchData={fetchData}
              data={{
                id: operator.id.toString(),
                user_id: operator.user_id.toString(),
                role_id: `${operator.role}`,
              }}
              roleData={roleData}
            />
            <DeleteButton
              fetchData={fetchData}
              endpoint="operator"
              id={operator.id.toString()}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
