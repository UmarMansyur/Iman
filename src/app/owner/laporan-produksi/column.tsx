/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table-column-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatProduction } from "@/lib/utils";
import DeleteButton from "@/components/delete-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

export const columns = (
  fetchReports: () => Promise<void>,
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
    cell: ({ row }) => {
      const data = row.original as any;
      return data.created_at
        ? new Date(data.created_at).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })
        : "-";
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
            {morningOperator && (
              <Avatar className={`${afternoonOperator ? "absolute z-10" : ""}`}>
                <AvatarImage src={morningOperator?.thumbnail} />
                <AvatarFallback>
                  {morningOperator?.username?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            )}
            {afternoonOperator && (
              <Avatar className={`${morningOperator ? "relative left-4" : ""}`}>
                <AvatarImage src={afternoonOperator?.thumbnail} />
                <AvatarFallback>
                  {afternoonOperator?.username?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
          <div>
            {morningOperator && (
              <>
                <p>{morningOperator?.username} (Pagi)</p>
                <p className="text-sm text-muted-foreground">
                  {morningOperator?.email}
                </p>
              </>
            )}
            {afternoonOperator && (
              <>
                <p>{afternoonOperator?.username} (Siang)</p>
                <p className="text-sm text-muted-foreground">
                  {afternoonOperator?.email}
                </p>
              </>
            )}
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
    header: "Jumlah Produksi Pagi",
    cell: ({ row }) => {
      const data = row.original as any;
      const production = formatProduction(data.morning_shift_amount);
      return (
        <>
          {data.morning_shift_amount ? (
            <>
              {production.bal} Bal - {production.pack} Pack
            </>
          ) : (
            "-"
          )}
        </>
      );
    },
  },
  {
    accessorKey: "afternoon_shift_amount",
    header: "Jumlah Produksi Siang",
    cell: ({ row }) => {
      const data = row.original as any;
      const production = formatProduction(data.afternoon_shift_amount);
      return (
        <div>
          {data.afternoon_shift_amount ? (
            <>
              {/* {production.pack} Pack / {production.bal} Bal */}
              {production.bal} Bal - {production.pack} Pack
            </>
          ) : (
            "-"
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "total_amount",
    header: "Total Produksi",
    cell: ({ row }) => {
      const data = row.original as any;
      const production = formatProduction(
        data.morning_shift_amount + data.afternoon_shift_amount
      );
      // return production.pack + " Pack / " + production.bal + " Bal";
      return production.bal + " Bal" + " - " + production.pack + " Pack"
    },
  },
  {
    accessorKey: "action",
    header: "Aksi",
    cell: ({ row }) => {
      const report = row.original as any;
      return (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <div className="rounded-md p-2 cursor-pointer">
              <MoreHorizontal className="w-4 h-4" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DeleteButton
              fetchData={fetchReports}
              endpoint="laporan-produksi"
              id={report.id.toString()}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
