/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import DetailDialog from "@/components/DetailDialog";

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
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tanggal" />
    ),
    cell: ({ row }) => (
      <div className="text-start">{new Date(row.original.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}</div>
    ),
  },
  {
    accessorKey: "invoice_code",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Kode Invoice" />
    ),
  },
  {
    accessorKey: "user_id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Petugas" />
    ),
    cell: ({ row }) => (
      <div className="text-start">{row.original.user?.username || "-"}</div>
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
    // remaining_balance
    accessorKey: "remaining_balance",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Sisa Pembayaran" />
    ),
    cell: ({ row }) => (
      <div className="text-start">{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" })
        .format(row.original.remaining_balance)
        .slice(0, -3)}</div>
    ),
  },
  {
    // maturity_date
    accessorKey: "maturity_date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tanggal Jatuh Tempo" />
    ),
    cell: ({ row }) => (
      row.original.maturity_date ? (
        <div className="text-start">{new Date(row.original.maturity_date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}</div>
      ) : (
        <div className="text-start">-</div>
      )
    ),
  },
  {
    accessorKey: "payment_status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status Pembayaran" />
    ),
    cell: ({ row }) => {
      const status = row.original.payment_status;
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
            className={`bg-blue-100 text-blue-800 hover:bg-blue-100/80 dark:bg-blue-800 dark:text-blue-300 border-0`}
          >
            Dibayar Sebagian
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
