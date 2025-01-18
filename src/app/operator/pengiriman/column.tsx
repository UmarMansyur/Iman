/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { ColumnDef } from "@tanstack/react-table";
import {Printer, PrinterCheckIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "@/components/data-table-column-header";
import DeliveryStatusDialog from "./delivery-status-dialog";
import Link from "next/link";
import StatusPayment from "@/components/status-payment";
import StatusDelivery from "@/components/StatusDelivery";

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
    accessorKey: "buyer",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Pembeli" />
    ),
    cell: ({ row }) => (
      <div className="text-start">{row.original.buyer.name}</div>
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
    accessorKey: "payment_status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status Pembayaran" />
    ),
    cell: ({ row }) => {
      return <StatusPayment status={row.original.payment_status} />;
    },
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
      return (
        <StatusDelivery status={row.original.deliveryTracking[0]?.status} />
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
        {row.original.maturity_date
          ? new Date(row.original.maturity_date).toLocaleDateString("id-ID")
          : "-"}
      </div>
    ),
  },
  {
    accessorKey: "print",
    header: "Cetak",
    cell: ({ row }) => {
      const data = row.original;
      return (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <div className="rounded-md p-2 cursor-pointer">
              <PrinterCheckIcon className="w-4 h-4" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {/* cetak kecil */}
            <Link
              href={"/operator/transaksi/pengiriman/print/" + data.invoice_code}
              className="hover:bg-gray-100"
              target="_blank"
            >
              <div className="flex p-2 items-center hover:bg-gray-50">
                <Printer className="w-4 h-4 mr-3"></Printer>
                <span>Cetak Kecil</span>
              </div>
            </Link>
            {/* cetak besar */}
            <Link
              href={
                "/operator/transaksi/pengiriman/print-besar/" +
                data.invoice_code
              }
              className="hover:bg-gray-100"
              target="_blank"
            >
              <div className="flex p-2 items-center hover:bg-gray-50">
                <Printer className="w-4 h-4 mr-3"></Printer>
                <span>Cetak Besar</span>
              </div>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
  {
    accessorKey: "action",
    header: "Aksi",
    cell: ({ row }) => {
      return (
        <DeliveryStatusDialog invoice={row.original} />
      );
    },
  },
];
