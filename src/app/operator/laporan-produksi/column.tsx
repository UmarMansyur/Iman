/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table-column-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ActionCell } from "./components/ActionCell";

export const columns = (
  fetchData: () => Promise<void>,
  page: number,
  limit: number,
  products: any[]
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
    cell: ({ row }) => {
      const data = row.original as any;
      return data.created_at ? new Date(data.created_at).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }) : "-";
    },
  },
  {
    accessorKey: "operators",
    header: "Operator",
    cell: ({ row }) => {
      const morningOperator = row.original.morning_shift_user as any;
      const afternoonOperator = row.original.afternoon_shift_user as any;
      return (
        <div className="flex items-start gap-4">
          <div className="relative flex-shrink-0">
            {
              morningOperator && (
                <Avatar className={`${afternoonOperator ? "absolute z-10" : ""}`}>
              <AvatarImage src={morningOperator?.thumbnail} />
              <AvatarFallback>{morningOperator?.username?.charAt(0)}</AvatarFallback>
                </Avatar>
              )
            }
            {
              afternoonOperator && (
                <Avatar className={`${morningOperator ? "relative left-4" : ""}`}>
              <AvatarImage src={afternoonOperator?.thumbnail} />
              <AvatarFallback>{afternoonOperator?.username?.charAt(0)}</AvatarFallback>
                </Avatar>
              )
            }
          </div>
          <div>
            {
              morningOperator && (
                <>
                  <p>{morningOperator?.username} (Pagi)</p>
                  <p className="text-sm text-muted-foreground">{morningOperator?.email}</p>
                </>
              )
            }
            {
              afternoonOperator && (
                <>
                  <p>{afternoonOperator?.username} (Siang)</p>
                  <p className="text-sm text-muted-foreground">{afternoonOperator?.email}</p>
                </>
              )
            }
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "product",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Produk" />
    ),
    cell: ({ row }) => {
      const product = row.original.product as any;
      return product ? product.name + " - " + product.type : "-";
    },
  },
  {
    accessorKey: "morning_shift_amount",
    header: "Jumlah Produksi Pagi(Pack)",
    cell: ({ row }) => {
      const data = row.original as any;
      return data.morning_shift_amount ? data.morning_shift_amount.toLocaleString("id-ID") : "-";
    },
  },
  {
    accessorKey: "afternoon_shift_amount",
    header: "Jumlah Produksi Siang(Pack)",
    cell: ({ row }) => {
      const data = row.original as any;
      return data.afternoon_shift_amount ? data.afternoon_shift_amount.toLocaleString("id-ID") : "-";
    },
  },
  {
    accessorKey: "total_amount",
    header: "Total Produksi",
    cell: ({ row }) => {
      const data = row.original as any;
      const totalAmount = (data.morning_shift_amount || 0) + (data.afternoon_shift_amount || 0);
      return totalAmount ? totalAmount.toLocaleString("id-ID") : "-";
    },
  },
  {
    accessorKey: "morning_shift_time",
    header: "Waktu Pelaporan Pagi",
    cell: ({ row }) => {
      const data = row.original as any;
      return data.morning_shift_time ? new Date(data.morning_shift_time).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }) : "-";
    },
  },
  {
    accessorKey: "afternoon_shift_time",
    header: "Waktu Pelaporan Siang",
    cell: ({ row }) => {
      const data = row.original as any;
      return data.afternoon_shift_time ? new Date(data.afternoon_shift_time).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }) : "-";
    },
  },
  {
    accessorKey: "action",
    header: "Aksi",
    cell: ({ row }) => <ActionCell row={row} fetchData={fetchData} products={products} />, 
  },
];
