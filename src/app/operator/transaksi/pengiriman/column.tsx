/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Printer } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "@/components/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import DetailDialog from "../detail-dialog";
import DeliveryStatusDialog from "./delivery-status-dialog";
import Link from "next/link";

const statusColors = {
  Process:
    "bg-yellow-100 text-yellow-400 hover:bg-yellow-100/80 dark:bg-yellow-400 dark:text-yellow-300 border-0",
  Sent: "bg-blue-100 text-blue-400 hover:bg-blue-100/80 dark:bg-blue-400 dark:text-blue-300 border-0",
  Done: "bg-green-100 text-green-400 hover:bg-green-100/80 dark:bg-green-400 dark:text-green-300 border-0",
  Cancel:
    "bg-red-100 text-red-400 hover:bg-red-100/80 dark:bg-red-400 dark:text-red-300 border-0",
};

const statusText = {
  Process: "Sedang Diproses",
  Sent: "Sedang Dikirim",
  Done: "Selesai",
  Cancel: "Batal",
};

export const columns = (page: number, limit: number): ColumnDef<any>[] => [
  {
    id: "index",
    header: "No",
    cell: ({ row }) => (page - 1) * limit + row.index + 1,
  },
  {
    accessorKey: "invoice_code",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Kode Invoice" />
    ),
  },
  {
    accessorKey: "is_distributor",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Distributor" />
    ),
    cell: ({ row }) => (
      <div className="text-start">
        {row.original.is_distributor === true ? "Distributor" : "Regular"}
      </div>
    ),
  },
  {
    accessorKey: "buyer",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Pembeli" />
    ),
    cell: ({ row }) => (
      <div className="text-start">{row.original.buyer?.name || "-"}</div>
    ),
  },
  {
    accessorKey: "total",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total" />
    ),
    cell: ({ row }) => (
      <div className="text-start">
        {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" })
          .format(row.original.total)
          .slice(0, -3)}
      </div>
    ),
  },
  {
    accessorKey: "payment_method",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Metode Pembayaran" />
    ),
    cell: ({ row }) => (
      <div className="text-start">{row.original.payment_method.name}</div>
    ),
  },
  {
    accessorKey: "deliveryTracking",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status Pengiriman" />
    ),
    cell: ({ row }) => {
      const status = row.original.deliveryTracking[0]?.status;
      return (
        <Badge
          variant="outline"
          className={`text-sm px-3 py-1 ${
            statusColors[status as keyof typeof statusColors]
          }`}
        >
          {statusText[status as keyof typeof statusText]}
        </Badge>
      );
    },
  },
  {
    accessorKey: "maturity_date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Jatuh Tempo" />
    ),
    cell: ({ row }) => (
      <div>
        {row.original.maturity_date === null ? (
          <div className="text-start">-</div>
        ) : (
          <div>{new Date(row.original.maturity_date).toLocaleDateString("id-ID")}</div>
        )}
      </div>
    ),
  },
  {
    accessorKey: "print",
    header: "Cetak",
    cell: ({ row }) => (
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <div className="rounded-md p-2 cursor-pointer">
            <Printer className="w-4 h-4" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <div className="flex flex-col gap-2">
            <Link
              href={`/operator/transaksi/pengiriman/print-besar/${row.original.invoice_code}`}
              target="_blank"
              className="w-full px-2 hover:bg-gray-100 py-2"
            >
              Ukuran Besar
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <Link
              href={`/operator/transaksi/pengiriman/print/${row.original.invoice_code}`}
              target="_blank"
              className="w-full px-2 hover:bg-gray-100 py-2"
            >
              Ukuran Kecil
            </Link>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      //
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
            <DeliveryStatusDialog invoice={row.original} />
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
