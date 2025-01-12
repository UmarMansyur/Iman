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
import DetailDialog from "./detail-dialog";
import DeleteButton from "@/components/delete-button";
import Link from "next/link";
import UploadBukti from "./upload-bukti";
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
      if (status === "Unpaid") {
        return (
          <Badge
            variant="outline"
            className={`bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80 dark:bg-yellow-800 dark:text-yellow-300 border-0`}
          >
           Belum Bayar
          </Badge>
        );
      }
      if (status === "Pending") {
        return (
          <Badge
            variant="outline"
            className={`bg-gray-100 text-gray-800 hover:bg-gray-100/80 dark:bg-gray-800 dark:text-gray-300 border-0`}
          >
            Menunggu Konfirmasi
          </Badge>
        );
      }
      if (status === "Paid") {
        return (
          <Badge
            variant="outline"
            className={`bg-green-100 text-green-800 hover:bg-green-100/80 dark:bg-green-800 dark:text-green-300 border-0`}
          >
            Dibayar Sebagian
          </Badge>
        );
      }
      if (status === "Failed") {
        return (
          <Badge
            variant="outline"
            className={`bg-red-100 text-red-800 hover:bg-red-100/80 dark:bg-red-800 dark:text-red-300 border-0`}
          >
            Gagal
          </Badge>
        );
      }
      if (status === "Cancelled") {
        return (
          <Badge
            variant="outline"
            className={`bg-red-100 text-red-800 hover:bg-red-100/80 dark:bg-red-800 dark:text-red-300 border-0`}
          >
            Ditolak
          </Badge>
        );
      }
      if (status === "Paid_Off") {
        return (
          <Badge
            variant="outline"
            className={`bg-green-100 text-green-800 hover:bg-green-100/80 dark:bg-green-800 dark:text-green-300 border-0`}
          >
            Lunas
          </Badge>
        );
      }
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
    accessorKey: "proof_of_payment_2",
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
