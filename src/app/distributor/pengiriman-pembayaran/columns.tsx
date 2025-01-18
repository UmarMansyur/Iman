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
import OrderPabrik from "./order-pabrik";
import StatusPayment from "@/components/status-payment";
import StatusDelivery from "@/components/StatusDelivery";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  })
    .format(value)
    .slice(0, -3);
};

export const columns = (products: any, metodePembayaran: any): ColumnDef<any>[] => [
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tanggal" />
    ),
    cell: ({ row }) => {
      return new Date(row.original.created_at).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    },
  },
  {
    accessorKey: "invoice_code",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Kode Invoice" />
    ),
  },
  {
    accessorKey: "buyer_id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nama Pembeli" />
    ),
    cell: ({ row }) => {
      return row.original.buyer.name;
    },
  },
  {
    accessorKey: "remaining_balance",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Sisa Pembayaran" />
    ),
    cell: ({ row }) => {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(row.original.remaining_balance);
    },
  },
  // Paymet method
  {
    accessorKey: "payment_method.name",
    header: "Metode Pembayaran",
    cell: ({ row }) => {
      return row.original.payment_method.name;
    },
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
      return <StatusPayment status={status} />
    },
  },
  {
    accessorKey: "status_delivery",
    header: "Status Pengiriman",
    cell: ({ row }) => {
      return <StatusDelivery status={row.original.status_delivery} />
    },
  },
  {
    // test untuk
    id: "actions",
    header: "Aksi",
    cell: function Cell({ row }) {
      const data = row.original as any;

      return (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <Dialog>
              <DialogTrigger
                asChild
                className="w-full cursor-pointer p-2 hover:bg-gray-50"
              >
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
                              {formatCurrency(data.amount + data.cost_delivery)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </DialogContent>
            </Dialog>
            <PembayaranDialog invoice={data} />
            {
              (data.status_payment === "Paid" || data.status_payment === "Paid_Off" || data.status_payment === "Pending") && (
                <OrderPabrik invoice={data} products={products} metodePembayaran={metodePembayaran} />
              )
            }
            <DeliveryStatusDialog invoice={data} />
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
