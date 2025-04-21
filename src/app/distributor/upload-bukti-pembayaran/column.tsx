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
import DetailDialog from "@/components/DetailDialog";
import DeleteButton from "@/components/delete-button";
import Link from "next/link";
import UploadBukti from "./upload-bukti";
import StatusPayment from "@/components/status-payment";
export const columns = (
  fetchData: () => Promise<void>,
  page: number,
  limit: number
): ColumnDef<any>[] => [
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
    accessorKey: "factory_id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Pabrik" />
    ),
    cell: ({ row }) => (
      <div className="text-start">{row.original.factory == null ? "Non Pabrik" : row.original.factory?.name}</div>
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
    accessorKey: "payment_status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status Pembayaran" />
    ),
    cell: ({ row }) => {
      const status = row.original.payment_status;
      return <StatusPayment status={status} />;
    },
  },
  {
    accessorKey: "payment_method",
    header: "Metode Pembayaran",
    cell: ({ row }) => (
      <div className="text-start">{row.original.payment_method.name}</div>
    ),
  },
  {
    accessorKey: "down_payment",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Uang Muka" />
    ),
    cell: ({ row }) => {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      })
        .format(row.original.down_payment)
        .slice(0, -3);
    },
  },
  // Sisa Pembayaran
  {
    accessorKey: "remaining_balance",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Sisa Pembayaran" />
    ),
    cell: ({ row }) => {
      // Jjika hasil pengurangan total dan uang muka negatif maka tampilkan Pengembalian
      if (row.original.total - row.original.down_payment < 0) {
        return (
          <div className="text-start">
            Pengembalian Sebesar{" "}
            {new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
            })
              .format(row.original.total - row.original.down_payment)
              .slice(0, -3)}
          </div>
        );
      } else {
        return new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
        })
          .format(row.original.remaining_balance)
          .slice(0, -3);
      }
    },
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
    accessorKey: "proof_of_payment",
    header: "Bukti Pembayaran",
    cell: ({ row }) => {
      return <UploadBukti data={row.original} fetchProducts={fetchData} />;
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
              href={`/distributor/data-order/print-besar/${row.original.invoice_code}`}
              target="_blank"
              className="w-full px-2 hover:bg-gray-100 py-2"
            >
              Ukuran Besar
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <Link
              href={`/distributor/data-order/print/${row.original.invoice_code}`}
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
            {(row.original.payment_status === "Pending" || row.original.payment_status === "Unpaid") && (
              <DeleteButton
                id={row.original.id}
                fetchData={fetchData}
                endpoint="/transaction"
              />
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
