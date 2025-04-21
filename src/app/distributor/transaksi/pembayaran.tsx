"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { 
  CreditCard, 
  User, 
  Package,
  Receipt,
  CreditCardIcon,
  AlertCircle,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

const StatusBadge = ({ status, type }: { status: string, type: 'payment' | 'delivery' }) => {
  const paymentStatusColors = {
    Pending: "bg-yellow-100 text-yellow-800",
    Paid: "bg-blue-100 text-blue-800",
    Paid_Off: "bg-green-100 text-green-800",
    Failed: "bg-red-100 text-red-800",
  };

  const deliveryStatusColors = {
    Process: "bg-blue-100 text-blue-800",
    Delivered: "bg-green-100 text-green-800",
    Cancelled: "bg-red-100 text-red-800",
  };

  const getStatusLabel = (status: string) => {
    const statusMap: { [key: string]: string } = {
      Pending: "Menunggu",
      Paid: "Dibayar Sebagian",
      Paid_Off: "Lunas",
      Failed: "Gagal",
      Process: "Dalam Proses",
      Delivered: "Terkirim",
      Cancelled: "Dibatalkan"
    };
    return statusMap[status] || status;
  };

  const colors = type === 'payment' ? paymentStatusColors : deliveryStatusColors;
  return (
    <Badge className={colors[status as keyof typeof colors]}>
      {getStatusLabel(status)}
    </Badge>
  );
};

interface InvoiceData {
  id: number;
  invoice_code: string;
  status_payment: string;
  status_delivery: string;
  amount: number;
  cost_delivery: number;
  down_payment: number;
  remaining_balance: number;
  desc_delivery: string;
  created_at: string;
  buyer: {
    name: string;
    address: string;
  };
  payment_method: {
    name: string;
  };
  DetailTransactionDistributor: Array<{
    desc: string;
    amount: number;
    price: number;
    sale_price: number;
    discount: number;
  }>;
  distributor: {
    username: string;
    email: string;
  };
  location_distributor: {
    name: string;
  };
}

export default function DetailInvoiceDialog({ invoice }: { invoice: InvoiceData }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(invoice.status_payment);
  const [amount, setAmount] = useState("");
  const [isValidAmount, setIsValidAmount] = useState(true);

  const formatCurrency = (value: number) => {
    return `Rp ${value.toLocaleString('id-ID')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatNumber = (value: string) => {
    const number = value.replace(/\D/g, "");
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const validateAmount = (value: string) => {
    const numAmount = parseFloat(value.replace(/\./g, "")) || 0;
    return numAmount === invoice.remaining_balance;
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatNumber(e.target.value);
    setAmount(formattedValue);
    setIsValidAmount(validateAmount(formattedValue));
  };

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      setLoading(true);
      const response = await fetch("/api/distributor/pembayaran", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: invoice.id,
          status_payment: status,
          amount_payment: parseFloat(amount.replace(/\./g, "")),
        }),
      });
      setLoading(false);
      if (!response.ok) throw new Error("Gagal mengubah status pembayaran");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transaksi-distributor"] });
      toast.success("Status pembayaran berhasil diubah");
      setOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild className="w-full cursor-pointer p-2 hover:bg-gray-50">
        <Button variant="ghost" className="w-full justify-start py-0 px-2 ">
          <CreditCard className="w-4 h-4" /> Ubah Status Pembayaran
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Receipt className="w-6 h-6" />
            Detail Invoice {invoice.invoice_code}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-100px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informasi Umum */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Informasi Umum
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm text-gray-500">Tanggal Pembuatan</Label>
                  <p className="font-medium">{formatDate(invoice.created_at)}</p>
                </div>
                <div className="flex justify-between items-center">
                  <Label className="text-sm text-gray-500">Status Pembayaran</Label>
                  <StatusBadge status={invoice.status_payment} type="payment" />
                </div>
                <div className="flex justify-between items-center">
                  <Label className="text-sm text-gray-500">Status Pengiriman</Label>
                  <StatusBadge status={invoice.status_delivery} type="delivery" />
                </div>
              </CardContent>
            </Card>

            {/* Informasi Pelanggan */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Informasi Pelanggan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm text-gray-500">Nama Pelanggan</Label>
                  <p className="font-medium">{invoice.buyer.name}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Alamat</Label>
                  <p className="font-medium">{invoice.buyer.address}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Lokasi Pengiriman</Label>
                  <p className="font-medium">{invoice.location_distributor.name}</p>
                </div>
              </CardContent>
            </Card>
              {/* Detail Produk */}
              <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Detail Produk
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {invoice.DetailTransactionDistributor.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-4 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">{item.desc}</p>
                        <p className="text-sm text-gray-500">Jumlah: {item.amount} unit</p>
                        {item.discount > 0 && (
                          <p className="text-sm text-green-600">
                            Diskon: {formatCurrency(item.discount)}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(item.price)}</p>
                        <p className="text-sm text-gray-500">
                          Harga Jual: {formatCurrency(item.sale_price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Detail Pembayaran */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCardIcon className="w-5 h-5" />
                  Detail Pembayaran
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm text-gray-500">Metode Pembayaran</Label>
                  <p className="font-medium">{invoice.payment_method.name}</p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Pembelian</span>
                    <span className="font-medium">{formatCurrency(invoice.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Biaya Pengiriman</span>
                    <span className="font-medium">{formatCurrency(invoice.cost_delivery)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Uang Muka</span>
                    <span className="font-medium">{formatCurrency(invoice.down_payment)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Sisa Pembayaran</span>
                    <span className="text-primary">{formatCurrency(invoice.remaining_balance)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

          

            {/* Form Ubah Status */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Ubah Status Pembayaran</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Status Pembayaran</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih status pembayaran" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Menunggu</SelectItem>
                      <SelectItem value="Paid">Dibayar Sebagian</SelectItem>
                      <SelectItem value="Paid_Off">Lunas</SelectItem>
                      <SelectItem value="Failed">Gagal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {status === "Paid_Off" && (
                  <div className="space-y-2">
                    <Label>Jumlah Pelunasan</Label>
                    <Input
                      type="text"
                      value={amount}
                      onChange={handleAmountChange}
                      placeholder="Masukkan jumlah pembayaran"
                      className={!isValidAmount ? "border-red-500" : ""}
                    />
                    {!isValidAmount && (
                      <p className="text-sm text-red-500">
                        Jumlah harus sama dengan sisa pembayaran ({formatCurrency(invoice.remaining_balance)})
                      </p>
                    )}
                  </div>
                )}

                <Button 
                  onClick={() => mutation.mutate()}
                  disabled={loading || (status === "Paid_Off" && !isValidAmount)}
                  className="w-full"
                >
                  {loading ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}