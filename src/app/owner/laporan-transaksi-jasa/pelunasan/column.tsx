/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table-column-header";
import Detail from "./components/detail";
export const columns = (page: number, limit: number): ColumnDef<any>[] => [
  {
    id: "index",
    header: "No",
    cell: ({ row }) => (page - 1) * limit + row.index + 1,
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tanggal" />
    ),
    cell: ({ row }) => {
      const data = row.original as any;
      return new Date(data.created_at).toLocaleString("id-ID", {
        dateStyle: "short",
        timeStyle: "short",
      });
    },
  },
  {
    accessorKey: "transaction_code",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Kode Transaksi" />
    ),
    cell: ({ row }) => {
      const data = row.original as any;
      return data.transaction_code;
    },
  },
  {
    accessorKey: "user_id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Petugas" />
    ),
    cell: ({ row }) => {
      const data = row.original as any;
      return data.user.username;
    },
  },
  {
    accessorKey: "buyer_id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Pembeli" />
    ),
    cell: ({ row }) => {
      const data = row.original as any;
      return data.buyer.name;
    },
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total Pembelian" />
    ),
    cell: ({ row }) => {
      const data = row.original as any;
      return data.amount
        ? new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
          })
            .format(data.amount)
            .slice(0, -3)
        : "-";
    },
  },
  {
    accessorKey: "remaining_amount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Sisa Pembayaran" />
    ),
    cell: ({ row }) => {
      const data = row.original as any;
      return data.remaining_balance
        ? new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
          })
            .format(data.remaining_balance)
            .slice(0, -3)
        : "Rp. 0";
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const data = row.original as any;
      return data.status === "Pending"
        ? "Menunggu Konfirmasi"
        : data.status === "Paid"
        ? "Dibayar Sebagian"
        : data.status === "Canceled"
        ? "Dibatalkan"
        : data.status === "Paid_Off"
        ? "Lunas"
        : "";
    },
  },
  {
    accessorKey: "payment_method",
    header: "Metode Pembayaran",
    cell: ({ row }) => {
      const data = row.original as any;
      return data.payment_method.name;
    },
  },
  {
    accessorKey: "maturity_date",
    header: "Tanggal Jatuh Tempo",
    cell: ({ row }) => {
      const data = row.original as any;
      return new Date(data.maturity_date).toLocaleString("id-ID", {
        dateStyle: "short",
      });
    },
  },
  {
    accessorKey: "action",
    header: "Aksi",
    cell: ({ row }) => {
      const data = row.original as any;
      return (
        <Detail data={data} />
      );
    },
  },
];
