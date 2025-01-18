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
import { Calendar, MapPin, Truck, CreditCard, CheckCircle2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import StatusPayment from "@/components/status-payment";
import StatusDelivery from "@/components/StatusDelivery";

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

  const updateStatus = async () => {
    const response = await fetch(`/api/pelunasan`, {
      method: "PATCH",
      body: JSON.stringify({ id: invoice.id }),
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

  const handleSimpan = async () => {
    await mutation.mutateAsync();
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
              <StatusPayment status={invoice.payment_status} />
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Truck className="w-4 h-4" />
                <p className="text-sm text-muted-foreground">Status Pengiriman</p>
              </div>
              <StatusDelivery status={invoice.deliveryTracking[0]?.status} />
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
                    <p className="text-sm text-muted-foreground">Sisa Pembayaran</p>
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
                    src={invoice.proof_of_payment} 
                    alt="Bukti Pembayaran" 
                    fill
                    className="object-contain rounded-lg"
                  />
                </div>
              </Card>
            </div>
          )}
          <Card>
            <CardHeader>
              <CardTitle className="text-start text-sm">
                <p>Perhatian: </p>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Jika invoice ini mau dinyatakan lunas, klik tombol simpan untuk mengubah status invoice.</p>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <DialogTrigger asChild>
                <Button variant="destructive">
                  Tutup
                </Button>
              </DialogTrigger>
              <DialogTrigger asChild>
                <Button variant="default" onClick={handleSimpan}>
                  Simpan
                </Button>
              </DialogTrigger>
            </CardFooter>
          </Card>
        </div>
        
      </DialogContent>
    </Dialog>
  );
}