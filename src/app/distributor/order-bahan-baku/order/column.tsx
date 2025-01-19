/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table-column-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ActionCell } from "./components/ActionCell";
import { Eye, PrinterCheckIcon } from "lucide-react";
import Link from "next/link";

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
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tanggal" />
    ),
    cell: ({ row }) => (
      <div className="text-start">
        {new Date(row.original.created_at).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
    ),
  },
  {
    accessorKey: "distributor",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Distributor" />
    ),
    cell: ({ row }) => (
      <div className="text-start flex items-center gap-2">
        <Avatar>
          <AvatarImage src={row.original.distributor?.thumbnail} />
          <AvatarFallback>
            {row.original.distributor?.username?.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="text-start">
          <p>{row.original.distributor?.username}</p>
          <p className="text-xs text-muted-foreground">
            {row.original.distributor?.email}
          </p>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "total",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total Harga Pemesanan" />
    ),
    cell: ({ row }) => (
      <div className="text-start">
        Rp. {new Intl.NumberFormat("id-ID").format(row.original.total)}
      </div>
    ),
  },
  {
    accessorKey: "DetailOrderBahanBakuDistributor",
    header: "Item",
    cell: ({ row }) => (
      <div className="text-start">
        {row.original.DetailOrderBahanBakuDistributor?.map((item: any) => (
          <div key={item.id}>
            {item.material_distributor?.name} / {item.material_distributor?.unit?.name}
          </div>
        ))}
      </div>
    ),
  },
  {
    accessorKey: "desc",
    header: "Keterangan",
    cell: ({ row }) => (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="bg-danger2 text-white border-none shadow-danger2/50 shadow-sm hover:bg-danger2/80 hover:shadow-danger2/60 hover:text-white">
            <Eye className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Detail Order</DialogTitle>
            <DialogDescription>
              Detail informasi order bahan baku
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4">
              <div className="flex justify-between">
                <div>
                  <Label>Distributor</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Avatar>
                      <AvatarImage src={row.original.distributor?.thumbnail} />
                      <AvatarFallback>
                        {row.original.distributor?.username?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {row.original.distributor?.username}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {row.original.distributor?.email}
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(row.original.created_at).toLocaleDateString(
                      "id-ID",
                      {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      }
                    )}
                  </div>
                </div>
              </div>

              <div>
                <Label>Factory</Label>
                <p className="mt-1">{row.original.factory}</p>
              </div>

              <div>
                <Label>Factory Distributor</Label>
                <p className="mt-1">{row.original.factoryDistributor?.name}</p>
              </div>

              <div>
                <Label>Keterangan</Label>
                <p className="mt-1">{row.original.desc}</p>
              </div>

              <div>
                <Label>Type</Label>
                <p className="mt-1">{row.original.type_preorder ? 'Pre Order' : 'Ready Stock'}</p>
              </div>

              <div>
                <Label>Daftar Bahan</Label>
                <div className="border rounded-lg mt-2">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">Material</th>
                        <th className="px-4 py-2 text-left">Jumlah</th>
                        <th className="px-4 py-2 text-left">Jumlah Diterima</th>
                        <th className="px-4 py-2 text-left">Harga</th>
                        <th className="px-4 py-2 text-left">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {row.original.DetailOrderBahanBakuDistributor?.map(
                        (detail: any, index: number) => (
                          <tr key={index} className="border-t">
                            <td className="px-4 py-2">
                              {detail.material_distributor?.name} /{" "}
                              {detail.material_distributor?.unit?.name}
                            </td>
                            <td className="px-4 py-2">
                              {detail.amount.toLocaleString("id-ID")}
                            </td>
                            <td className="px-4 py-2">
                              {detail.amount_received ? detail.amount_received.toLocaleString("id-ID") : "0"}
                            </td>
                            <td className="px-4 py-2">
                              Rp {detail.price.toLocaleString("id-ID")}
                            </td>
                            <td className="px-4 py-2">
                              Rp {detail.sub_total.toLocaleString("id-ID")}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-2 font-medium text-right"
                        >
                          Total Keseluruhan:
                        </td>
                        <td className="px-4 py-2 font-bold">
                          Rp {row.original.total.toLocaleString("id-ID")}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Tutup</Button>
              </DialogClose>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    ),
  },
  {
    accessorKey: "Cetak",
    header: "Cetak",
    cell: ({ row }) => (
      <Link href={`/distributor/order-bahan-baku/order/${row.original.id}/print`} target="_blank">
        <Button
          variant="outline"
          size="sm"
          className="bg-yellow-500 text-white border-none shadow-yellow-500/50 shadow-sm hover:bg-yellow-600 hover:shadow-yellow-600/50 hover:text-white"
        >
          <PrinterCheckIcon className="w-4 h-4" />
        </Button>
      </Link>
    ),
  },
  {
    accessorKey: "action",
    header: "Aksi",
    cell: ({ row }) => <ActionCell row={row} fetchData={fetchData} />,
  },
];