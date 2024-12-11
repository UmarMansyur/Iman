/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(dashboard)/laporan-produksi/columns.tsx
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table-column-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
    accessorKey: "product",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Produk" />
    ),
    cell: ({ row }) => {
      const product = row.original.product;
      return (
        <div>
          <p className="font-medium">{product.name}</p>
          <p className="text-sm text-muted-foreground">{product.type}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "user",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Operator" />
    ),
    cell: ({ row }) => {
      const user = row.original.user;
      return (
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src={user?.thumbnail} />
            <AvatarFallback>{user?.username?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{user?.username}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total Produksi" />
    ),
    cell: ({ row }) => {
      return row.original.amount.toLocaleString("id-ID");
    },
  },
  {
    accessorKey: "shift",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Detail Shift" />
    ),
    cell: ({ row }) => {
      return (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              Lihat Detail
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Detail Shift Produksi</DialogTitle>
              <DialogDescription>
                Informasi detail produksi per shift
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <h3 className="font-medium">Shift Pagi</h3>
                  <p>Jumlah: {row.original.morning_shift_amount?.toLocaleString("id-ID") || "-"}</p>
                  <p>Waktu: {row.original.morning_shift_time ? new Date(row.original.morning_shift_time).toLocaleTimeString("id-ID") : "-"}</p>
                </div>
                <div>
                  <h3 className="font-medium">Shift Siang</h3>
                  <p>Jumlah: {row.original.afternoon_shift_amount?.toLocaleString("id-ID") || "-"}</p>
                  <p>Waktu: {row.original.afternoon_shift_time ? new Date(row.original.afternoon_shift_time).toLocaleTimeString("id-ID") : "-"}</p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Tutup</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tanggal" />
    ),
    cell: ({ row }) => {
      return new Date(row.original.created_at).toLocaleDateString("id-ID", {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },
  },
  {
    id: "actions",
    header: "Aksi",
    cell: ({ row }) => <ActionCell row={row} fetchData={fetchData} />,
  },
];