/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import DetailDialog from "./detail-dialog";

export const columns = (
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
            {status}
          </Badge>
        );
      }
      if (status === "Paid") {
        return (
          <Badge
            variant="outline"
            className={`bg-green-100 text-green-800 hover:bg-green-100/80 dark:bg-green-800 dark:text-green-300 border-0`}
          >
            {status}
          </Badge>
        );
      }
      if (status === "Failed") {
        return (
          <Badge
            variant="outline"
            className={`bg-red-100 text-red-800 hover:bg-red-100/80 dark:bg-red-800 dark:text-red-300 border-0`}
          >
            {status}
          </Badge>
        );
      }
      if (status === "Cancelled") {
        return (
          <Badge
            variant="outline"
            className={`bg-red-100 text-red-800 hover:bg-red-100/80 dark:bg-red-800 dark:text-red-300 border-0`}
          >
            {status}
          </Badge>
        );
      }
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
    accessorKey: "action",
    header: "Aksi",
    cell: ({ row }) => {
      return <DetailDialog invoice={row.original} />;
    },
  },
];
