/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Eye, Package, Truck, Calendar, CreditCard } from "lucide-react";
import { useUserStore } from "@/store/user-store";

interface DetailDialogProps {
  invoice: any;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  })
    .format(amount)
    .slice(0, -3);
};

export default function DetailDialog({ invoice }: DetailDialogProps) {
  const getStatusColor = (status: string) => {
    const colors = {
      Pending: "bg-yellow-100 text-yellow-800",
      Paid: "bg-green-100 text-green-800",
      Process: "bg-blue-100 text-blue-800",
      Done: "bg-green-100 text-green-800",
      Cancel: "bg-red-100 text-red-800",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const { user } = useUserStore();

  return (
    <Dialog>
      <DialogTrigger className="w-full m-0 p-0 flex items-center justify-start hover:bg-gray-50 px-2 py-2">
        <Eye className="w-4 h-4 mr-2" /> Detail
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>Invoice {invoice.invoice_code}</span>
              {invoice.type_preorder && (
                <Badge
                  variant="outline"
                  className="bg-purple-100 text-purple-800 border-0"
                >
                  Pre-Order
                </Badge>
              )}
            </div>
            <Badge
              variant="outline"
              className={`${getStatusColor(invoice.payment_status)} border-0`}
            >
              {invoice.payment_status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Information */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Calendar className="w-4 h-4" />
                Tanggal Pemesanan
              </div>
              <p className="font-medium">{formatDate(invoice.created_at)}</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Package className="w-4 h-4" />
                Total Item
              </div>
              <p className="font-medium">
                {invoice?.DetailTransactionDistributor.length} items
              </p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <CreditCard className="w-4 h-4" />
                Metode Pembayaran
              </div>
              <p className="font-medium">{invoice.payment_method.name}</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Truck className="w-4 h-4" />
                Status Pengiriman
              </div>
              <Badge
                variant="outline"
                className={`${getStatusColor(
                  invoice.status_delivery
                )} border-0`}
              >
                {invoice.status_delivery === "Process"
                  ? "Sedang Diproses"
                  : invoice.status_delivery === "Done"
                  ? "Selesai"
                  : invoice.status_delivery === "Sent"
                  ? "Dikirim"
                  : invoice.status_delivery === "Cancel"
                  ? "Batal"
                  : "Pending"}
              </Badge>
            </Card>
          </div>

          {/* Factory & Buyer Information */}
          <div className="grid grid-cols-1 gap-6">

            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> Informasi Pembeli
              </h3>
              <Card className="p-4">
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Nama Pembeli
                    </p>
                    <p className="font-medium">{invoice.buyer.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Alamat Pengiriman
                    </p>
                    <p className="font-medium">{invoice.buyer.address}</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Product Details */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Package className="w-4 h-4" /> Detail Produk
            </h3>
            <Card>
              <div className="p-4 space-y-4">
                {invoice.DetailTransactionDistributor.map((item: any) => (
                  <div key={item.id} className="grid grid-cols-5 gap-4">
                    <div className="col-span-3">
                      <p className="font-medium">{item.desc}</p>
                      <p className="text-sm text-muted-foreground">
                        Harga Satuan: {formatCurrency(item.price)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Jumlah</p>
                      <p className="font-medium">{item.amount}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Subtotal</p>
                      <p className="font-medium">
                        {formatCurrency(item.amount * item.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="p-4 space-y-2">
                <div className="flex justify-between">
                  <p className="text-muted-foreground">Subtotal</p>
                  <p className="font-medium">
                    {formatCurrency(invoice.amount)}
                  </p>
                </div>
                <div className="flex justify-between">
                  <p className="text-muted-foreground">Uang Muka</p>
                  <p className="font-medium">
                    {formatCurrency(invoice.down_payment)}
                  </p>
                </div>
                <div className="flex justify-between">
                  <p className="text-muted-foreground">Sisa Pembayaran</p>
                  <p className="font-medium">
                    {formatCurrency(invoice.remaining_balance)}
                  </p>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <p className="font-semibold">Total(Sub Total - Uang Muka)</p>
                  {/* sub total */}
                  <p className="font-semibold text-lg">
                    {formatCurrency(invoice.amount - invoice.down_payment)}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div>
              <h3 className="font-semibold mb-3">Catatan</h3>
              <Card className="p-4">
                <p>{invoice.notes}</p>
              </Card>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
