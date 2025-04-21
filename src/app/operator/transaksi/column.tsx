/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "@/components/data-table-column-header";
import DetailDialog from "./detail-dialog";
import DeleteButtonQuery from "@/components/DeleteButton";
import StatusPayment from "@/components/status-payment";

export const columns = (page: number, limit: number): ColumnDef<any>[] => [
  {
    id: "index",
    header: "No",
    cell: ({ row }) => (page - 1) * limit + row.index + 1,
  },
  {
    accessorKey: "invoice_code",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Kode Invoice"/>
    ),
  },
  {
    accessorKey: "is_distributor",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Distributor"/>
    ),
    cell: ({ row }) => (
      <div className="text-start">
        {row.original.is_distributor === true ? "Distributor" : "Regular"}
      </div>
    ),
  },
  {
    accessorKey: "buyer_id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Pembeli"/>
    ),
    cell: ({ row }) => (
      <div className="text-start">
        {row.original.buyer?.name || "-"}
      </div>
    ),
  },
  {
    accessorKey: "total",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total"/>
    ),
    cell: ({ row }) => (
      <div className="text-start">
        {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(row.original.total).slice(0, -3)}
      </div>
    ),
  },
  {
    accessorKey: "payment_method_id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Metode Pembayaran"/>
    ),
    cell: ({ row }) => (
      <div className="text-start">
        {row.original.payment_method.name}
      </div>
    ),
  },
  {
    accessorKey: "payment_status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status Pembayaran"/>
    ),
    cell: ({ row }) => (
      <StatusPayment status={row.original.payment_status} />
    ),
  },
  {
    accessorKey: "maturity_date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Jatuh Tempo"/>
    ),
    cell: ({ row }) => (
      <div>
        {new Date(row.original.maturity_date).toLocaleDateString("id-ID")}
      </div>
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
              <MoreHorizontal className="w-4 h-4" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DetailDialog invoice={row.original} />
            {
              row.original.payment_status === "Pending" && (
                <DeleteButtonQuery endpoint="transaction" id={row.original.id.toString()} queryKey="transactions" />
              )
            }
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

