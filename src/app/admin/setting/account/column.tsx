/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const columns = (fetchData: () => Promise<void>, page: number, limit: number): ColumnDef<any>[] => [
  {
    id: "index",
    header: "No",
    cell: ({ row }) => (page - 1) * limit + row.index + 1,
  },
  {
    accessorKey: "thumbnail",
    header: "Foto Profil",
    cell: ({ row }) => {
      const username: string = row.getValue("username");
      const initial = username.charAt(0).toUpperCase();
      return (
        <Avatar className="w-8 h-8">
          {row.original.thumbnail && (
            <AvatarImage src={row.original.thumbnail} />
          )}
          <AvatarFallback>{initial}</AvatarFallback>
        </Avatar>
      );
    },
  },
  {
    accessorKey: "username",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Username"/>
    ),
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="email"/>
    ),
  },
  {
    accessorKey: "action",
    header: "Aksi",
    cell: ({ row }) => {
      return (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <div className="rounded-md p-2 cursor-pointer">
              <Settings className="w-4 h-4" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <Form data={row.original} fetchData={fetchData} />
            <DeleteButton fetchData={fetchData} endpoint="user" id={row.original.id.toString()} />
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

