/* eslint-disable @typescript-eslint/no-explicit-any */
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Eye, MoreHorizontal } from "lucide-react";
import { DataTableColumnHeader } from "@/components/data-table-column-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import DeliveryStatusDialog from "./delivery-status-dialog";
import PembayaranDialog from "./pembayaran";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  })
    .format(value)
    .slice(0, -3);
};

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: "invoice_code",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Kode Invoice" />
    ),
  },
  {
    accessorKey: "buyer.name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nama Pembeli" />
    ),
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total" />
    ),
    cell: ({ row }) => {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(row.original.amount);
    },
  },
  {
    accessorKey: "status_payment",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status Pembayaran" />
    ),
    cell: ({ row }) => {
      const status = row.original.status_payment;
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            status === "Paid"
              ? "bg-green-100 text-green-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {status}
        </span>
      );
    },
  },
  {
    accessorKey: "status_delivery",
    header: "Status Pengiriman",
    cell: ({ row }) => {
      const status = row.original.status_delivery;
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            status === "Delivered"
              ? "bg-green-100 text-green-800"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {status}
        </span>
      );
    },
  },
  {
    // test untuk
    id: "actions",
    header: "Aksi",
    cell: function Cell({ row }) {
      const data = row.original as any;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <Dialog>
                <DialogTrigger asChild>
                  <div className="flex w-full items-center">
                    <Eye className="h-4 w-4 mr-2" />
                    Lihat Detail
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      Detail Transaksi - {data.invoice_code}
                    </DialogTitle>
                  </DialogHeader>

                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Informasi Pembeli</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="font-semibold">Nama</p>
                            <p>{data.buyer.name}</p>
                          </div>
                          <div>
                            <p className="font-semibold">Alamat</p>
                            <p>{data.buyer.address}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Detail Transaksi</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="font-semibold">Status Pembayaran</p>
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  data.status_payment === "Paid"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {data.status_payment}
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold">Metode Pembayaran</p>
                              <p>{data.payment_method.name}</p>
                            </div>
                          </div>

                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Deskripsi</TableHead>
                                <TableHead>Jumlah</TableHead>
                                <TableHead>Harga</TableHead>
                                <TableHead>Total</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {data.DetailTransactionDistributor.map(
                                (item: any) => (
                                  <TableRow key={item.id}>
                                    <TableCell>{item.desc}</TableCell>
                                    <TableCell>{item.amount}</TableCell>
                                    <TableCell>
                                      {formatCurrency(item.price)}
                                    </TableCell>
                                    <TableCell>
                                      {formatCurrency(item.sale_price)}
                                    </TableCell>
                                  </TableRow>
                                )
                              )}
                            </TableBody>
                          </Table>

                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Subtotal</span>
                              <span>{formatCurrency(data.amount)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Ongkos Kirim</span>
                              <span>{formatCurrency(data.cost_delivery)}</span>
                            </div>
                            <div className="flex justify-between font-bold">
                              <span>Total</span>
                              <span>
                                {formatCurrency(
                                  data.amount + data.cost_delivery
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </DialogContent>
              </Dialog>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <PembayaranDialog invoice={data} />
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <DeliveryStatusDialog invoice={data} />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
