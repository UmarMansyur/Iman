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
import { PaymentSetting } from "@/lib/definitions";

export const columns = (fetchData: () => Promise<void>, page: number, limit: number): ColumnDef<PaymentSetting>[] => [
  {
    id: "index",
    header: "No",
    cell: ({ row }) => (page - 1) * limit + row.index + 1,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Jenis Metode Pembayaran"/>
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
            <Form payment={row.original as PaymentSetting} fetchData={fetchData} />
            <DeleteButton fetchData={fetchData} endpoint="payment" id={row.original.id.toString()} />
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

