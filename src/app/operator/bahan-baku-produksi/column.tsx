/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { DataTableColumnHeader } from "@/components/data-table-column-header";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
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
    accessorKey: "tanggal",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tanggal" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.original.created_at);
      return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
  },
  {
    accessorKey: "Operator",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Operator" />
    ),
    cell: ({ row }) => {
      const operator = row.original as any;
      return (
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src={operator.user?.thumbnail} />
            <AvatarFallback>{operator.user?.username?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p>{operator.user?.username}</p>
            <p className="text-sm text-muted-foreground">
              {operator.user?.email}
            </p>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "total_amount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Bahan Baku" />
    ),
    cell: ({ row }) => {
      const totalAmount = row.original as any;
      const response = totalAmount.detail.map((detail: any, index: number) => {
        return <div key={'amount-'+index}>{detail.amount} {detail.material_unit} - {detail.unit}</div>
      })
      return response
    },
  },
  {
    accessorKey: "desc",
    header: "Keterangan",
    cell: ({ row }) => (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            Lihat
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Rincian Penggunaan Bahan Baku</DialogTitle>
            <DialogDescription>
              Rincian penggunaan bahan baku
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4">
              <div>
                <Label>Operator Pelapor</Label>
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
                <Label>Daftar Bahan</Label>
                <div className="border rounded-lg mt-2">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">Material</th>
                        <th className="px-4 py-2 text-left">Unit</th>
                        <th className="px-4 py-2 text-left">Jumlah</th>
                      </tr>
                    </thead>
                    <tbody>
                      {row.original.DetailReportMaterialStock?.map(
                        (detail: any, index: number) => (
                          <tr key={index} className="border-t">
                            <td className="px-4 py-2">
                              {detail.materialUnit?.material?.name}
                            </td>
                            <td className="px-4 py-2">
                              {detail.materialUnit?.unit?.name}
                            </td>
                            <td className="px-4 py-2">
                              {detail.amount.toLocaleString("id-ID")}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
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
    accessorKey: "action",
    header: "Aksi",
    cell: ({ row }) => <ActionCell row={row} fetchData={fetchData} />,
  },

];
