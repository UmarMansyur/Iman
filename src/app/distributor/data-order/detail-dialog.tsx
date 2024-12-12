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
import { Eye } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface DetailDialogProps {
  invoice: any;
}

export default function DetailDialog({ invoice }: DetailDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="w-full justify-start px-2">
          <Eye className="w-4 h-4" /> Detail
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detail Transaksi {invoice.invoice_code}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informasi Utama */}
          <div>
            <h3 className="font-semibold mb-2">Informasi Utama</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Status Pembayaran</p>
                <Badge variant="outline" className={`mt-1 ${
                  invoice.payment_status === 'Pending' ? 'bg-gray-100 text-gray-800' :
                  invoice.payment_status === 'Paid' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                } border-0`}>
                  {invoice.payment_status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status Pengiriman</p>
                {
                  invoice.deliveryTracking[0]?.status === 'Pending' && (
                    <Badge variant="outline" className={`bg-gray-100 text-gray-800 hover:bg-gray-100/80 dark:bg-gray-800 dark:text-gray-300 border-0`}>
                      Pending
                    </Badge>
                  )
                }
                {
                  invoice.deliveryTracking[0]?.status === 'Process' && (
                    <Badge variant="outline" className={`bg-gray-100 text-gray-800 hover:bg-gray-100/80 dark:bg-gray-800 dark:text-gray-300 border-0`}>
                      Proses
                    </Badge>
                  )
                }
                {
                  invoice.deliveryTracking[0]?.status === 'Done' && (
                    <Badge variant="outline" className={`bg-gray-100 text-gray-800 hover:bg-gray-100/80 dark:bg-gray-800 dark:text-gray-300 border-0`}>
                      Selesai
                    </Badge>
                  )
                }
                {
                  invoice.deliveryTracking[0]?.status === 'Cancel' && (
                    <Badge variant="outline" className={`bg-gray-100 text-gray-800 hover:bg-gray-100/80 dark:bg-gray-800 dark:text-gray-300 border-0`}>
                      Batal
                    </Badge>
                  )
                }
              </div>
            </div>
          </div>

          <Separator />

          {/* Detail Pembeli */}
          <div>
            <h3 className="font-semibold mb-2">Detail Pembeli</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Pembeli</p>
                <p className="font-medium">{invoice.buyer}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Alamat</p>
                <p className="font-medium">{invoice.buyer_address}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Detail Pembayaran */}
          <div>
            <h3 className="font-semibold mb-2">Detail Pembayaran</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Subtotal</p>
                <p className="font-medium">
                  {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(invoice.sub_total).slice(0, -3)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Down Payment</p>
                <p className="font-medium">
                  {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(invoice.down_payment).slice(0, -3)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sisa Pembayaran</p>
                <p className="font-medium">
                  {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(invoice.remaining_balance).slice(0, -3)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="font-semibold text-lg">
                  {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(invoice.total).slice(0, -3)}
                </p>
              </div>
            </div>
          </div>

          {/* Detail Produk */}
          <div>
            <h3 className="font-semibold mb-2">Detail Produk</h3>
            <div className="space-y-2">
              {invoice.detailInvoices.map((item: any) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{item.desc}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.amount} x {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(item.price).slice(0, -3)}
                    </p>
                  </div>
                  <p className="font-medium">
                    {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(item.sub_total).slice(0, -3)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 