/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Truck, CreditCard, CheckCircle2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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
  const [reason, setReason] = useState<string>("");

  const updateStatus = async (status: string) => {
    const response = await fetch(`/api/konfirmasi-pembayaran`, {
      method: "PATCH",
      body: JSON.stringify({ id: invoice.id, status: status, reason: reason }),
    });
    const data = await response.json();
    if(!response.ok) {
      toast.error(data.message);
    } else {
      toast.success(data.message);
    }
  }

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: updateStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });

  const handleSetujui = async () => {
    await mutation.mutateAsync("Paid");
  }

  const handleTolak = async () => {
    if(!reason) {
      toast.error("Keterangan penolakan tidak boleh kosong");
      return;
    }
    await mutation.mutateAsync("Cancelled");
    setReason("");
    // CLOSE DIALOG
  }



  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="bg-blue-600 hover:bg-blue-600 text-white hover:text-white w-8 h-8">
          <CheckCircle2 className="w-4 h-4" />
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
                invoice.payment_status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                invoice.payment_status === 'Paid' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              } border-0`}>
                {invoice.payment_status}
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

          {invoice.proof_of_payment ? (
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
          ) : (
            <div>
              <h3 className="font-semibold mb-3">Bukti Pembayaran</h3>
              <Card className="p-4 bg-red-100 text-red-800">
                <p>Belum ada bukti pembayaran. Anda tidak dapat mengubah status pembayaran sebelum ada bukti pembayaran.</p>
              </Card>
            </div>
          )}
          <Card>
            <CardHeader>
              <CardTitle className="text-start text-sm">
                <p>Keterangan: </p>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="resize-none"
                disabled={invoice.proof_of_payment ? false : true}
                placeholder="Masukkan keterangan penolakan"
              />
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <DialogTrigger asChild>
                <Button variant="destructive" onClick={handleTolak} disabled={invoice.proof_of_payment ? false : true}>
                  Tolak
                </Button>
              </DialogTrigger>
              <DialogTrigger asChild>
                <Button variant="default" onClick={handleSetujui} disabled={invoice.proof_of_payment ? false : true}>
                  Setujui
                </Button>
              </DialogTrigger>
            </CardFooter>
          </Card>
        </div>
        
      </DialogContent>
    </Dialog>
  );
}