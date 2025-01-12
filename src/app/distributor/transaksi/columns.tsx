/* eslint-disable @typescript-eslint/no-explicit-any */
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Printer } from "lucide-react";
import Link from "next/link";
import { DataTableColumnHeader } from "@/components/data-table-column-header";
import DeleteButtonQuery from "@/components/DeleteButton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DetailDialog from "./detail-dialog";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  })
    .format(value)
    .slice(0, -3);
};

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tanggal" />
    ),
    cell: ({ row }) => {
      return new Date(row.original.created_at).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
  },
  {
    accessorKey: "invoice_code",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Kode Invoice" />
    ),
  },
  {
    accessorKey: "buyer.name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nama Pembeli" />
    ),
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total" />
    ),
    cell: ({ row }) => {
      return formatCurrency(row.original.amount);
    },
  },
  {
    accessorKey: "status_payment",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status Pembayaran" />
    ),
    cell: ({ row }) => {
      const status = row.original.status_payment;
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            status === "Pending"
              ? "bg-yellow-100 text-yellow-800"
              : status === "Paid_Off"
              ? "bg-green-100 text-green-800"
              : status === "Paid"
              ? "bg-blue-100 text-blue-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {status === "Pending" && "Menunggu Pembayaran"}
          {status === "Paid_Off" && "Lunas"}
          {status === "Paid" && "Bayar Sebagian"}
          {status === "Failed" && "Gagal"}
        </span>
      );
    },
  },
  {
    accessorKey: "status_delivery",
    header: "Status Pengiriman",
    cell: ({ row }) => {
      const status = row.original.status_delivery;
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            status === "Sent"
              ? "bg-green-100 text-green-800"
              : status === "Process"
              ? "bg-blue-100 text-blue-800"
              : status === "Done"
              ? "bg-green-100 text-green-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {status === "Sent" && "Dikirim"}
          {status === "Process" && "Sedang Diproses"}
          {status === "Pending" && "Menunggu Pengiriman"}
          {status === "Done" && "Selesai"}
          {status === "Failed" && "Gagal"}
        </span>
      );
    },
  },
  // sisa pembayaran
  {
    accessorKey: "remaining_balance",
    header: "Sisa Pembayaran",
    cell: ({ row }) => {
      return formatCurrency(row.original.remaining_balance);
    },
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
              href={`/distributor/transaksi/print-besar/${row.original.invoice_code}`}
              target="_blank"
              className="w-full px-2 hover:bg-gray-100 py-2"
            >
              Ukuran Besar
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <Link
              href={`/distributor/transaksi/print/${row.original.invoice_code}`}
              target="_blank"
              className="w-full px-2 hover:bg-gray-100 py-2"
            >
              Ukuran Kecil
            </Link>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
  {
    id: "actions",
    header: "Aksi",
    cell: ({ row }) => {
      const data = row.original as any;
      return (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DetailDialog invoice={data} />
            {data.status_payment === "Pending" && (
              <DeleteButtonQuery
                endpoint={`/distributor/transaksi`}
                id={data.id}
                queryKey="transaksi-distributor"
              />
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
