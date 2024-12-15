/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "@/components/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import DetailDialog from "./detail-dialog";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import DeleteButtonQuery from "@/components/DeleteButton";

export const columns = (page: number, limit: number): ColumnDef<any>[] => [
  {
    id: "index",
    header: "No",
    cell: ({ row }) => (page - 1) * limit + row.index + 1,
  },
  {
    accessorKey: "invoice_code",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Kode Invoice"/>
    ),
  },
  {
    accessorKey: "buyer",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Pembeli"/>
    ),
    cell: ({ row }) => (
      <div className="text-start">
        {row.original.buyer.name}
      </div>
    ),
  },
  {
    accessorKey: "total",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total"/>
    ),
    cell: ({ row }) => (
      <div className="text-start">
        {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(row.original.total).slice(0, -3)}
      </div>
    ),
  },
  {
    accessorKey: "payment_method",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Metode Pembayaran"/>
    ),
    cell: ({ row }) => (
      <div className="text-start">
        {row.original.payment_method.name}
      </div>
    ),
  },
  {
    accessorKey: "deliveryTracking",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status Pengiriman"/>
    ),
    cell: ({ row }) => {
      const status = row.original.deliveryTracking[0]?.status;

      if(status === 'Process') {
        return <Badge variant="outline" className={`bg-blue-100 text-blue-400 hover:bg-blue-100/80 dark:bg-blue-400 dark:text-blue-300 border-0`}>
          Pending
        </Badge>
      }

      if(status === 'Sent') { 
        return <Badge variant="outline" className={`bg-yellow-100 text-yellow-400 hover:bg-yellow-100/80 dark:bg-yellow-400 dark:text-yellow-300 border-0`}>
          Dikirim
        </Badge>
      }


      if(status === 'Done') {
        return <Badge variant="outline" className={`bg-green-100 text-green-400 hover:bg-green-100/80 dark:bg-green-400 dark:text-green-300 border-0`}>
          Selesai
        </Badge>
      }

      if(status === 'Cancel') {
        return <Badge variant="outline" className={`bg-red-100 text-red-400 hover:bg-red-100/80 dark:bg-red-400 dark:text-red-300 border-0`}>
          Batal
        </Badge>
      }
    }
  },
  {
    accessorKey: "maturity_date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Jatuh Tempo"/>
    ),
    cell: ({ row }) => (
      <div>
        {new Date(row.original.maturity_date).toLocaleDateString("id-ID")}
      </div>
    ),
  },
  {
    accessorKey: "action",
    header: "Aksi",
    cell: ({ row }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="rounded-md p-2 cursor-pointer">
              <MoreHorizontal className="w-4 h-4" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DetailDialog invoice={row.original} />
            <Link href={`/operator/transaksi/edit/${row.original.id}`}>
              <Button variant="ghost" className="w-full justify-start px-2">
                <Pencil className="w-4 h-4" />
                Edit
              </Button>
            </Link>
            <DeleteButtonQuery endpoint="transaction" id={row.original.id.toString()} queryKey="transactions" />
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

