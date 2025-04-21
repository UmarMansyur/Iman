/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Truck, CreditCard } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { Card } from "@/components/ui/card";

interface DetailDialogProps {
  invoice: any;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", { 
    style: "currency", 
    currency: "IDR" 
  }).format(amount).slice(0, -3);
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

export default function DetailDialog({ invoice }: DetailDialogProps) {



  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" >
          Detail
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Invoice {invoice.invoice_code}</span>
            <div className="flex gap-2">
              {invoice.type_preorder && (
                <Badge variant="secondary">Pre-Order</Badge>
              )}
              {invoice.is_distributor && (
                <Badge variant="secondary">Distributor</Badge>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-4 h-4" />
                <p className="text-sm text-muted-foreground">Status Pembayaran</p>
              </div>
              <Badge className={`${
                invoice.payment_status === 'Unpaid' ? 'bg-red-100 text-red-800' :
                invoice.payment_status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                invoice.payment_status === 'Paid_Off' ? 'bg-green-100 text-green-800' :
                invoice.payment_status === 'Paid' ? 'bg-green-100 text-green-800' :
                invoice.payment_status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                'bg-red-100 text-red-800'
              } border-0`}>
                {invoice.payment_status === 'Unpaid' ? 'Belum Lunas' :
                invoice.payment_status === 'Pending' ? 'Menunggu Konfirmasi' :
                invoice.payment_status === 'Paid_Off' ? 'Lunas' :
                invoice.payment_status === 'Paid' ? 'Dibayar Sebagian' :
                invoice.payment_status === 'Cancelled' ? 'Dibatalkan' : 'Belum Lunas'
                }
              </Badge>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Truck className="w-4 h-4" />
                <p className="text-sm text-muted-foreground">Status Pengiriman</p>
              </div>
              <Badge className={`${
                invoice.deliveryTracking[0]?.status === 'Process' ? 'bg-blue-100 text-blue-800' :
                invoice.deliveryTracking[0]?.status === 'Done' ? 'bg-green-100 text-green-800' :
                invoice.deliveryTracking[0]?.status === 'Cancel' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              } border-0`}>
                {invoice.deliveryTracking[0]?.status === 'Process' ? 'Dalam Pengiriman' :
                 invoice.deliveryTracking[0]?.status === 'Done' ? 'Terkirim' :
                 invoice.deliveryTracking[0]?.status === 'Cancel' ? 'Dibatalkan' : 'Menunggu'}
              </Badge>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4" />
                <p className="text-sm text-muted-foreground">Tanggal Pemesanan</p>
              </div>
              <p className="font-medium">{formatDate(invoice.created_at)}</p>
            </Card>
          </div>

          <Separator />

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Informasi Pengiriman
              </h3>
              <Card className="p-4 space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Pabrik</p>
                  <p className="font-medium">{invoice.factory.name}</p>
                  <p className="text-sm text-muted-foreground">{invoice.factory.address}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pembeli</p>
                  <p className="font-medium">{invoice.buyer.name}</p>
                  <p className="text-sm text-muted-foreground">{invoice.buyer.address}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Lokasi Pengiriman</p>
                  <p className="font-medium">{invoice.deliveryTracking[0]?.location?.name}</p>
                </div>
              </Card>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Rincian Pembayaran</h3>
              <Card className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <p className="text-sm text-muted-foreground">Metode Pembayaran</p>
                    <p className="font-medium">{invoice.payment_method.name}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-sm text-muted-foreground">Subtotal</p>
                    <p className="font-medium">{formatCurrency(invoice.sub_total)}</p>
                  </div>
                  {invoice.discount > 0 && (
                    <div className="flex justify-between">
                      <p className="text-sm text-muted-foreground">Diskon</p>
                      <p className="font-medium text-green-600">-{formatCurrency(invoice.discount)}</p>
                    </div>
                  )}
                  {invoice.ppn > 0 && (
                    <div className="flex justify-between">
                      <p className="text-sm text-muted-foreground">PPN</p>
                      <p className="font-medium">{formatCurrency(invoice.ppn)}</p>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <p className="text-sm text-muted-foreground">Down Payment</p>
                    <p className="font-medium">{formatCurrency(invoice.down_payment)}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-sm text-muted-foreground">Sisa Pembayaran</p>
                    <p className="font-medium">{formatCurrency(invoice.remaining_balance)}</p>
                  </div>
                  <Separator />
                  <div className="flex justify-between pt-2">
                    <p className="font-semibold">Total</p>
                    <p className="font-semibold text-lg">{formatCurrency(invoice.total)}</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Detail Produk</h3>
            <Card>
              <div className="divide-y">
                {invoice.detailInvoices.map((item: any) => (
                  <div key={item.id} className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">{item.desc}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.product.type}
                        </p>
                      </div>
                      <p className="font-medium">{formatCurrency(item.sub_total)}</p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {item.amount} x {formatCurrency(item.price)}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {invoice.notes && (
            <div>
              <h3 className="font-semibold mb-3">Catatan</h3>
              <Card className="p-4">
                <p>{invoice.notes}</p>
              </Card>
            </div>
          )}

          {invoice.proof_of_payment && (
            <div>
              <h3 className="font-semibold mb-3">Bukti Pembayaran</h3>
              <Card className="p-4">
                <div className="relative w-full h-[300px]">
                  <Image 
                    src={invoice.proof_of_payment} 
                    alt="Bukti Pembayaran" 
                    fill
                    className="object-contain rounded-lg"
                  />
                </div>
              </Card>
            </div>
          )}
          {invoice.proof_of_payment_2 && (
            <div>
              <h3 className="font-semibold mb-3">Bukti Pembayaran Pelunasan</h3>
              <Card className="p-4">
                <div className="relative w-full h-[300px]">
                  <Image 
                    src={invoice.proof_of_payment_2} 
                    alt="Bukti Pembayaran Pelunasan" 
                    fill
                    className="object-contain rounded-lg"
                  />
                </div>
              </Card>
            </div>
          )}
        </div>
        
      </DialogContent>
    </Dialog>
  );
}