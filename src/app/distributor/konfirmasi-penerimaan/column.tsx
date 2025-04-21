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
import SelesaiButton from "@/components/selesai-button";
import StatusPayment from "@/components/status-payment";
import StatusDelivery from "@/components/StatusDelivery";

export const columns = (fetchData: () => Promise<void>, page: number, limit: number): ColumnDef<any>[] => [
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
  // tampilkan nama pabrik
  {
    accessorKey: "factory",
    header: "Pabrik",
    cell: ({ row }) => (
      <div className="text-start">
        {row.original.factory_id === null ? "Non Pabrik" : row.original.factory.name}
      </div>
    ),
  },
  {
    accessorKey: "buyer",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Pembeli"/>
    ),
    cell: ({ row }) => (
      <div className="text-start">
        {row.original.buyer.name}
      </div>
    ),
  },
  {
    accessorKey: "payment_status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status Pembayaran"/>
    ),
    cell: ({ row }) => {
      return <StatusPayment status={row.original.payment_status} />
    }
  },
  {
    accessorKey: "payment_method",
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
    accessorKey: "deliveryTracking",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status Pengiriman"/>
    ),
    cell: ({ row }) => {
      return <StatusDelivery status={row.original.deliveryTracking[0]?.status} />
    }
  },
  // tampilkan 
  {
    accessorKey: "maturity_date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Jatuh Tempo"/>
    ),
    cell: ({ row }) => (
      <div>
        {
          row.original.maturity_date && new Date(row.original.maturity_date).toLocaleDateString("id-ID")
        }
        {
          !row.original.maturity_date && (row.original.factory_id === null ? "-" : "Belum diset operator pabrik")
        }
      </div>
    ),
  },
  // tampilkan sisa pembayaran
  {
    accessorKey: "remaining_balance",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Sisa Pembayaran"/>
    ),
    cell: ({ row }) => (
      <div className="text-start">
        {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(row.original.remaining_balance).slice(0, -3)}
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
            <SelesaiButton id={row.original.id} fetchData={fetchData}/>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

