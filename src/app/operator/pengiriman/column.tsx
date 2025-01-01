/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "@/components/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import DetailDialog from "./detail-dialog";
import DeliveryStatusDialog from "./delivery-status-dialog";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
    accessorKey: "payment_status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status Pembayaran"/>
    ),
    cell: ({ row }) => {
      const status = row.original.payment_status;
      // const variants: { [key: string]: string } = {
      //   PENDING: "bg-gray-100 text-gray-800 hover:bg-gray-100/80 dark:bg-gray-800 dark:text-gray-300",
      //   PAID: "bg-green-100 text-green-800 hover:bg-green-100/80 dark:bg-green-800 dark:text-green-300",
      //   FAILED: "bg-red-100 text-red-800 hover:bg-red-100/80 dark:bg-red-800 dark:text-red-300",
      //   CANCELLED: "bg-red-100 text-red-800 hover:bg-red-100/80 dark:bg-red-800 dark:text-red-300"
      // };
      
      if(status === 'Pending') {
        return <Badge variant="outline" className={`bg-gray-100 text-gray-800 hover:bg-gray-100/80 dark:bg-gray-800 dark:text-gray-300 border-0`}>
          Menunggu Konfirmasi Pembayaran
        </Badge>
      }
      if(status === 'Paid') {
        return <Badge variant="outline" className={`bg-green-100 text-green-800 hover:bg-green-100/80 dark:bg-green-800 dark:text-green-300 border-0`}>
          Dibayar
        </Badge>
      }
      if(status === 'Paid_Off') {
        return <Badge variant="outline" className={`bg-green-100 text-green-800 hover:bg-green-100/80 dark:bg-green-800 dark:text-green-300 border-0`}>
          Lunas
        </Badge>
      }
      if(status === 'Failed') {
        return <Badge variant="outline" className={`bg-red-100 text-red-800 hover:bg-red-100/80 dark:bg-red-800 dark:text-red-300 border-0`}>
          Gagal
        </Badge>
      }
      if(status === 'Cancelled') {
        return <Badge variant="outline" className={`bg-red-100 text-red-800 hover:bg-red-100/80 dark:bg-red-800 dark:text-red-300 border-0`}>
          Ditolak
        </Badge>
      }
    }
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
        return <Badge variant="outline" className={`bg-gray-100 text-gray-800 hover:bg-gray-100/80 dark:bg-gray-800 dark:text-gray-300 border-0`}>
          Proses
        </Badge>
      }

      if(status === 'Sent') { 
        return <Badge variant="outline" className={`bg-blue-100 text-blue-800 hover:bg-blue-100/80 dark:bg-blue-800 dark:text-blue-300 border-0`}>
          Dikirim
        </Badge>
      }
      if(status === 'Done') {
        return <Badge variant="outline" className={`bg-green-100 text-green-800 hover:bg-green-100/80 dark:bg-green-800 dark:text-green-300 border-0`}>
          Selesai
        </Badge>
      }

      if(status === 'Cancel') {
        return <Badge variant="outline" className={`bg-red-100 text-red-800 hover:bg-red-100/80 dark:bg-red-800 dark:text-red-300 border-0`}>
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
        {
          row.original.maturity_date ? new Date(row.original.maturity_date).toLocaleDateString("id-ID") : "-"
        }
      </div>
    ),
  },
  {
    accessorKey: "print",
    header: "Cetak",
    cell: ({ row }) => (
      <Link href={`/operator/transaksi/pengiriman/print/${row.original.id}`} target="_blank">
        <Button variant="outline">
          Cetak
        </Button>
      </Link>
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
            <DeliveryStatusDialog invoice={row.original}/>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

