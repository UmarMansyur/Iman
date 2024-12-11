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
    accessorKey: "user",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Operator Pemesan" />
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
    accessorKey: "total_item",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total Item" />
    ),
    cell: ({ row }) => <div className="text-start">{row.original.total_item}</div>,
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.original.status;
      switch (status) {
        case "Pending":
          return <Badge variant="outline" className="bg-yellow-500 text-white">Menunggu</Badge>;
        case "Approved": 
          return <Badge className="bg-blue-500 text-white">Diterima</Badge>;
        case "Rejected":
          return <Badge className="bg-red-500 text-white">Ditolak</Badge>;
        default:
          return <Badge>{status}</Badge>;
      }
    },
  },
  {
    accessorKey: "desc",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Keterangan" />
    ),
    cell: ({ row }) => (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            Lihat
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
                    <p className="font-medium">{row.original.user?.username}</p>
                    <p className="text-sm text-muted-foreground">
                      {row.original.user?.email}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <Label>Keterangan</Label>
                <p className="mt-1">{row.original.desc}</p>
              </div>

              <div>
                <Label>Status</Label>
                <p className="mt-1">{row.original.status}</p>
              </div>

              <div>
                <Label>Daftar Bahan</Label>
                <div className="border rounded-lg mt-2">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">Material</th>
                        <th className="px-4 py-2 text-left">Jumlah</th>
                        <th className="px-4 py-2 text-left">Harga</th>
                        <th className="px-4 py-2 text-left">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {row.original.DetailOrderMaterialUnit?.map(
                        (detail: any, index: number) => (
                          <tr key={index} className="border-t">
                            <td className="px-4 py-2">
                              {/* {JSON.stringify(detail)} */}
                              {detail.materialUnit?.material?.name} /{" "}
                              {detail.materialUnit?.unit?.name}
                            </td>
                            <td className="px-4 py-2">
                              {detail.amount.toLocaleString("id-ID")}
                            </td>
                            <td className="px-4 py-2">
                              Rp {detail.price.toLocaleString("id-ID")}
                            </td>
                            <td className="px-4 py-2">
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
                        <td className="px-4 py-2 font-bold">
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
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    ),
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
        })}
      </div>
    ),
  },
  {
    accessorKey: "action",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Aksi" />
    ),
    cell: ({ row }) => <ActionCell row={row} fetchData={fetchData} />,
  },
];
