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
import { Badge } from "@/components/ui/badge";
import { ActionCell } from "./components/ActionCell";
import { PrinterCheckIcon, SearchCodeIcon } from "lucide-react";
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
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
    ),
  },
  {
    accessorKey: "user",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Operator" />
    ),
    cell: ({ row }) => (
      <div className="text-start flex items-center gap-2">
        <Avatar>
          <AvatarImage src={row.original.user?.thumbnail} />
          <AvatarFallback>
            {row.original.user?.username?.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="text-start">
          <p>{row.original.user?.username}</p>
          <p className="text-xs text-muted-foreground">
            {row.original.user?.email}
          </p>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "price",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total Harga" />
    ),
    cell: ({ row }) => (
      <div className="text-start">
        Rp. {new Intl.NumberFormat("id-ID").format(row.original.price)}
      </div>
    ),
  },
  {
    accessorKey: "Item",
    header: "Item",
    cell: ({ row }) => (
      <div className="text-start">
        {row.original.DetailOrderMaterialUnit?.map((item: any) => (
          <div key={item.id}>
            {item.materialUnit?.material?.name} /{" "}
            {item.materialUnit?.unit?.name}
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
          <Button
            variant="outline"
            size="sm"
            className="bg-danger2 text-white border-none shadow-danger2/50 shadow-sm hover:bg-danger2/80 hover:shadow-danger2/60 hover:text-white"
          >
            <SearchCodeIcon className="w-4 h-4" />
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
                  <Label>Operator Pemesan</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Avatar>
                      <AvatarImage src={row.original.user?.thumbnail} />
                      <AvatarFallback>
                        {row.original.user?.username?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {row.original.user?.username}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {row.original.user?.email}
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
                  {row.original.status === "Pending" && (
                    <Badge
                      variant="outline"
                      className="bg-yellow-500 text-white border-none"
                    >
                      Menunggu
                    </Badge>
                  )}
                  {row.original.status === "Approved" && (
                    <Badge className="bg-blue-500 text-white border-none">
                      Diterima
                    </Badge>
                  )}
                  {row.original.status === "Rejected" && (
                    <Badge className="bg-red-500 text-white border-none">
                      Ditolak
                    </Badge>
                  )}
                </div>
              </div>

              <div>
                <Label>Keterangan</Label>
                <p className="mt-1">{row.original.desc}</p>
              </div>

              <div>
                <Label>Daftar Bahan</Label>
                <div className="border rounded-lg mt-2">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">Material</th>
                        <th className="px-4 py-2 text-right">Jumlah</th>
                        <th className="px-4 py-2 text-right">Harga</th>
                        <th className="px-4 py-2 text-right">Sub Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {row.original.DetailOrderMaterialUnit?.map(
                        (detail: any, index: number) => (
                          <tr key={index} className="border-t">
                            <td className="px-4 py-2">
                              {detail.materialUnit?.material?.name} /{" "}
                              {detail.materialUnit?.unit?.name}
                            </td>
                            <td className="px-4 py-2 text-right">
                              {detail.amount.toLocaleString("id-ID")}
                            </td>
                            <td className="px-4 py-2 text-right">
                              Rp {detail.price.toLocaleString("id-ID")}
                            </td>
                            <td className="px-4 py-2 text-right">
                              Rp{" "}
                              {(detail.amount * detail.price).toLocaleString(
                                "id-ID"
                              )}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td
                          colSpan={3}
                          className="px-4 py-2 font-medium text-right"
                        >
                          Total Keseluruhan:
                        </td>
                        <td className="px-4 py-2 font-bold text-right">
                          Rp{" "}
                          {row.original.DetailOrderMaterialUnit?.reduce(
                            (sum: number, detail: any) =>
                              sum + detail.amount * detail.price,
                            0
                          ).toLocaleString("id-ID")}
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
              <DialogClose asChild>
                <a href={`/operator/persediaan-bahan-baku/order/${row.original.id}/print`} target="_blank" className="bg-yellow-500 text-white border-none shadow-yellow-500/50 shadow-sm hover:bg-yellow-600 hover:shadow-yellow-600/50 hover:text-white rounded-md px-4 py-2 flex items-center gap-2">
                  <PrinterCheckIcon className="w-4 h-4" /> Cetak
                </a>
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
      <Link
        href={`/operator/persediaan-bahan-baku/order/${row.original.id}/print`}
        target="_blank"
      >
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
