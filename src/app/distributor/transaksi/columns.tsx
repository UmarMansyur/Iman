/* eslint-disable @typescript-eslint/no-explicit-any */
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Eye, MoreHorizontal, Printer } from "lucide-react";
import Link from "next/link";
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
import DeleteButtonQuery from "@/components/DeleteButton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tanggal" />
    ),
    cell: ({ row }) => {
      return new Date(row.original.created_at).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
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
            status === "Pending"
              ? "bg-yellow-100 text-yellow-800"
              : status === "Paid_Off"
              ? "bg-green-100 text-green-800"
              : status === "Paid"
              ? "bg-blue-100 text-blue-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {status === "Pending" && "Menunggu Pembayaran"}
          {status === "Paid_Off" && "Lunas"}
          {status === "Paid" && "Bayar Sebagian"}
          {status === "Failed" && "Gagal"}
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
          {status === "Sent" && "Dikirim"}
          {status === "Process" && "Sedang Diproses"}
          {status === "Pending" && "Menunggu Pengiriman"}
          {status === "Failed" && "Gagal"}
        </span>
      );
    },
  },
  // sisa pembayaran
  {
    accessorKey: "remaining_balance",
    header: "Sisa Pembayaran",
    cell: ({ row }) => {
      return formatCurrency(row.original.remaining_balance);
    },
  },
  {
    accessorKey: "print",
    header: "Cetak",
    cell: ({ row }) => (
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <div className="rounded-md p-2 cursor-pointer">
            <Printer className="w-4 h-4" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <div className="flex flex-col gap-2">
            <Link
              href={`/distributor/transaksi/print-besar/${row.original.id}`}
              target="_blank"
              className="w-full px-2 hover:bg-gray-100 py-2"
            >
              Ukuran Besar
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <Link
              href={`/distributor/transaksi/print/${row.original.id}`}
              target="_blank"
              className="w-full px-2 hover:bg-gray-100 py-2"
            >
              Ukuran Kecil
            </Link>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
  {
    id: "actions",
    header: "Aksi",
    cell: ({ row }) => {
      const data = row.original as any;
      return (
        <DropdownMenu modal={false}>
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
                    Lihat Detail Transaksi
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      Detail Transaksi - {data.invoice_code}
                    </DialogTitle>
                    <div className="text-sm text-gray-500">
                      Tanggal:{" "}
                      {new Date(data.created_at).toLocaleDateString("id-ID")}
                    </div>
                  </DialogHeader>

                  <div className="space-y-4">
                    {/* Informasi Pembeli */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Informasi Pembeli</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="font-semibold">Nama Pembeli</p>
                            <p>{data.buyer.name}</p>
                          </div>
                          <div>
                            <p className="font-semibold">Alamat Pengiriman</p>
                            <p>{data.buyer.address}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Status Transaksi */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Status Transaksi</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="font-semibold">Status Pembayaran</p>
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                data.status_payment === "Pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : data.status_payment === "Paid_Off"
                                  ? "bg-green-100 text-green-800"
                                  : data.status_payment === "Paid"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {data.status_payment === "Pending" &&
                                "Menunggu Pembayaran"}
                              {data.status_payment === "Paid_Off" && "Lunas"}
                              {data.status_payment === "Paid" &&
                                "Bayar Sebagian"}
                              {data.status_payment === "Failed" && "Gagal"}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold">Status Pengiriman</p>
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                data.status_delivery === "Delivered"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {data.status_delivery === "Process"
                                ? "Sedang Diproses"
                                : "Terkirim"}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Detail Pembayaran */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Informasi Pembayaran</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="font-semibold">Metode Pembayaran</p>
                            <p>{data.payment_method.name}</p>
                          </div>
                          <div>
                            <p className="font-semibold">Uang Muka</p>
                            <p>{formatCurrency(data.down_payment)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Detail Produk */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Detail Produk</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Nama Produk</TableHead>
                              <TableHead className="text-center">
                                Jumlah
                              </TableHead>
                              <TableHead>Harga Satuan</TableHead>
                              <TableHead>Total</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {data.DetailTransactionDistributor.map(
                              (item: any) => (
                                <TableRow key={item.id}>
                                  <TableCell>{item.desc}</TableCell>
                                  <TableCell className="">
                                    {item.amount}
                                  </TableCell>
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

                        {/* Ringkasan Biaya */}
                        <div className="mt-4 space-y-2 border-t pt-4">
                          <div className="flex justify-between">
                            <span>Subtotal Produk</span>
                            <span>{formatCurrency(data.amount)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Biaya Pengiriman</span>
                            <span>{formatCurrency(data.cost_delivery)}</span>
                          </div>
                          {data.discount > 0 && (
                            <div className="flex justify-between text-green-600">
                              <span>Diskon</span>
                              <span>-{formatCurrency(data.discount)}</span>
                            </div>
                          )}
                          {data.ppn > 0 && (
                            <div className="flex justify-between">
                              <span>PPN</span>
                              <span>{formatCurrency(data.ppn)}</span>
                            </div>
                          )}
                          <div className="flex justify-between font-bold border-t pt-2">
                            <span>Total Pembayaran</span>
                            <span>
                              {formatCurrency(
                                data.amount +
                                  data.cost_delivery -
                                  data.discount +
                                  data.ppn
                              )}
                            </span>
                          </div>
                          {data.down_payment > 0 && (
                            <div className="flex justify-between text-red-600 font-bold">
                              <span>Sisa Pembayaran</span>
                              <span>
                                {formatCurrency(data.remaining_balance)}
                              </span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Informasi Distributor */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Informasi Distributor</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="font-semibold">Nama Pengguna</p>
                            <p>{data.distributor.username}</p>
                          </div>
                          <div>
                            <p className="font-semibold">Email</p>
                            <p>{data.distributor.email}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </DialogContent>
              </Dialog>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            <PembayaranDialog invoice={data} />
            {data.status_payment === "Pending" && (
            <DeleteButtonQuery
              endpoint={`/distributor/transaksi`}
              id={data.id}
              queryKey="transaksi-distributor"
            />
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
