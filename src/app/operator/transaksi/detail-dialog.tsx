/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, Package, Truck, CreditCard, User } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";

interface DetailDialogProps {
  invoice: any;
}

export default function DetailDialog({ invoice }: DetailDialogProps) {
  const getStatusColor = (status: string) => {
    const colors = {
      "Menunggu": "bg-yellow-100 text-yellow-800 border-yellow-300",
      "Lunas": "bg-green-100 text-green-800 border-green-300",
      "Diproses": "bg-blue-100 text-blue-800 border-blue-300",
      "Selesai": "bg-green-100 text-green-800 border-green-300",
      "Dibatalkan": "bg-red-100 text-red-800 border-red-300",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center gap-2 hover:bg-blue-50 w-full justify-start"
        >
          <Eye className="w-4 h-4" />
          Rincian
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-2xl font-bold">
              Faktur {invoice.invoice_code}
            </DialogTitle>
            <div className="flex gap-2 pt-4">
              <Badge variant="outline" className={getStatusColor(invoice.payment_status)}>
                {invoice.payment_status === "Paid" && "Dibayar Sebagian"}
                {invoice.payment_status === "Pending" && "Menunggu Konfirmasi"}
                {invoice.payment_status === "Unpaid" && "Belum Bayar"}
                {invoice.payment_status === "Paid_Off" && "Lunas"}
              </Badge>
              <Badge variant="outline" className={getStatusColor(invoice.deliveryTracking[0]?.status)}>
                {invoice.deliveryTracking[0]?.status === "Process" && "Dalam Proses"}
                {invoice.deliveryTracking[0]?.status === "Sent" && "Dikirim"}
                {invoice.deliveryTracking[0]?.status === "Done" && "Diterima"}
                {invoice.deliveryTracking[0]?.status === "Cancel" && "Dibatalkan"}
              </Badge>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Dibuat pada: {format(new Date(invoice.created_at), "dd MMMM yyyy HH:mm")}
          </p>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6 mt-6">
          {/* Informasi Pembeli */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold">Informasi Pembeli</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Nama Pembeli</p>
                  <p className="font-medium">{invoice.buyer.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Alamat</p>
                  <p className="font-medium">{invoice.buyer.address}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informasi Pengiriman */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Truck className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold">Informasi Pengiriman</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Pengirim</p>
                  <p className="font-medium">{invoice.deliveryTracking[0]?.sales_man}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Lokasi Pengiriman</p>
                  <p className="font-medium">{invoice.deliveryTracking[0]?.location.name}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detail Produk */}
          <Card className="col-span-2">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold">Detail Produk</h3>
              </div>
              <div className="space-y-4">
                {invoice.detailInvoices.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-lg">{item.desc}</p>
                      <div className="flex gap-4 mt-1">
                        <p className="text-sm text-muted-foreground">
                          Jumlah: <span className="font-medium">{item.amount}</span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Harga: <span className="font-medium">
                            {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(item.price).slice(0, -3)}
                          </span>
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold text-lg">
                      {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(item.sub_total).slice(0, -3)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Detail Pembayaran */}
          <Card className="col-span-2">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-orange-600" />
                <h3 className="font-semibold">Detail Pembayaran</h3>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Metode Pembayaran</p>
                  <p className="font-medium text-lg">{invoice.payment_method?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Jatuh Tempo</p>
                  <p className="font-medium text-lg">
                    {format(new Date(invoice.maturity_date), "dd MMMM yyyy")}
                  </p>
                </div>
                <div className="col-span-2">
                  <Separator className="my-4" />
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <p className="text-muted-foreground">Subtotal</p>
                      <p className="font-medium">
                        {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(invoice.sub_total).slice(0, -3)}
                      </p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-muted-foreground">Uang Muka</p>
                      <p className="font-medium">
                        {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(invoice.down_payment).slice(0, -3)}
                      </p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-muted-foreground">Sisa Pembayaran</p>
                      <p className="font-medium">
                        {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(invoice.remaining_balance).slice(0, -3)}
                      </p>
                    </div>
                    <Separator className="my-4" />
                    <div className="flex justify-between">
                      <p className="font-semibold">Total</p>
                      <p className="font-semibold text-xl">
                        {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(invoice.total).slice(0, -3)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}