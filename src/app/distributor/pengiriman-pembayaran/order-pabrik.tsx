"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { 
  CreditCard, 
  Package, 
  Upload,
  User,
  Receipt,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TransactionDetail {
  id: number;
  desc: string;
  amount: number;
  price: number;
  sale_price: number;
  discount: number;
}

interface TransactionData {
  id: number;
  invoice_code: string;
  status_payment: string;
  status_delivery: string;
  amount: number;
  cost_delivery: number;
  desc_delivery: string;
  down_payment: number;
  remaining_balance: number;
  buyer: {
    name: string;
    address: string;
  };
  payment_method: {
    name: string;
  };
  DetailTransactionDistributor: TransactionDetail[];
}

export default function TransactionDialog({ invoice }: { invoice: TransactionData }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [downPayment, setDownPayment] = useState(invoice.down_payment.toString());

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(value);
  };

  const formatNumber = (value: string) => {
    const number = value.replace(/\D/g, "");
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (!['image/jpeg', 'image/png', 'application/pdf'].includes(selectedFile.type)) {
        toast.error('Format file harus JPG, PNG, atau PDF');
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error('Ukuran file maksimal 5MB');
        return;
      }
      setFile(selectedFile);
    }
  };

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error('Pilih file terlebih dahulu');
      
      const formData = new FormData();
      formData.append('payment_proof', file);
      formData.append('invoice_id', invoice.id.toString());
      formData.append('down_payment', downPayment.replace(/\./g, ''));

      const simulateProgress = () => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 5;
          setUploadProgress(progress);
          if (progress >= 100) clearInterval(interval);
        }, 100);
      };

      simulateProgress();

      setLoading(true);

      const response = await fetch("/api/distributor/payment-proof", {
        method: "POST",
        body: formData,
      });

      setLoading(false);

      if (!response.ok) throw new Error('Gagal mengunggah bukti pembayaran');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transaksi-distributor"] });
      toast.success("Bukti pembayaran berhasil diunggah");
      setOpen(false);
      setFile(null);
      setUploadProgress(0);
    },
    onError: (error: Error) => {
      toast.error(error.message);
      setUploadProgress(0);
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <CreditCard className="w-4 h-4 mr-2" /> Upload Bukti Pembayaran
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Receipt className="w-6 h-6" />
            Detail Invoice {invoice.invoice_code}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-100px)]">
          <div className="space-y-6 pr-4">
            {/* Informasi Pembeli dan Pengiriman */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Informasi Pembeli & Pengiriman
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-500">Nama Pembeli</Label>
                    <p className="font-medium">{invoice.buyer.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Alamat</Label>
                    <p className="font-medium">{invoice.buyer.address}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Status Pembayaran</Label>
                    <Badge variant={invoice.status_payment === 'Paid_Off' ? 'secondary' : 'outline'}>
                      {invoice.status_payment}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Status Pengiriman</Label>
                    <Badge variant={invoice.status_delivery === 'Process' ? 'default' : 'secondary'}>
                      {invoice.status_delivery}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Metode Pembayaran</Label>
                    <p className="font-medium">{invoice.payment_method.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Catatan Pengiriman</Label>
                    <p className="font-medium">{invoice.desc_delivery}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detail Produk */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Detail Produk
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative overflow-x-auto">
                  <table className="w-full text-sm text-left rtl:text-right">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3">Produk</th>
                        <th scope="col" className="px-6 py-3 text-center">Jumlah</th>
                        <th scope="col" className="px-6 py-3 text-center">Harga</th>
                        <th scope="col" className="px-6 py-3 text-center">Diskon</th>
                        <th scope="col" className="px-6 py-3 text-center">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.DetailTransactionDistributor.map((item, index) => (
                        <tr key={index} className="bg-white border-b">
                          <td className="px-6 py-4">{item.desc}</td>
                          <td className="px-6 py-4 text-center">{item.amount}</td>
                          <td className="px-6 py-4 text-center">{formatCurrency(item.price)}</td>
                          <td className="px-6 py-4 text-center">{formatCurrency(item.discount)}</td>
                          <td className="px-6 py-4 text-center">{formatCurrency(item.sale_price)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="font-semibold text-gray-900">
                        <td colSpan={4} className="px-6 py-3 text-right">Subtotal</td>
                        <td className="px-6 py-3 text-center">{formatCurrency(invoice.amount)}</td>
                      </tr>
                      <tr className="font-semibold text-gray-900">
                        <td colSpan={4} className="px-6 py-3 text-right">Ongkos Kirim</td>
                        <td className="px-6 py-3 text-center">{formatCurrency(invoice.cost_delivery)}</td>
                      </tr>
                      <tr className="font-semibold text-gray-900">
                        <td colSpan={4} className="px-6 py-3 text-right">Total</td>
                        <td className="px-6 py-3 text-center">{formatCurrency(invoice.amount + invoice.cost_delivery)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Form Pembayaran */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Form Pembayaran
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label>Uang Muka</Label>
                    <Input
                      type="text"
                      value={formatNumber(downPayment)}
                      onChange={(e) => setDownPayment(formatNumber(e.target.value))}
                      placeholder="Masukkan jumlah uang muka"
                      className="font-mono"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>Sisa Pembayaran</Label>
                    <Input
                      type="text"
                      value={formatNumber(invoice.remaining_balance.toString())}
                      disabled
                      className="font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Upload Bukti Pembayaran</Label>
                  <Input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                  <p className="text-sm text-gray-500">
                    Format yang didukung: JPG, PNG, PDF (Maks. 5MB)
                  </p>
                </div>

                {uploadProgress > 0 && (
                  <div className="space-y-2">
                    <Progress value={uploadProgress} className="w-full" />
                    <p className="text-sm text-gray-500 text-center">
                      Mengupload... {uploadProgress}%
                    </p>
                  </div>
                )}

                <Button 
                  onClick={() => mutation.mutate()}
                  disabled={!file || loading}
                  className="w-full"
                >
                  {loading ? "Memproses..." : "Simpan & Upload Bukti Pembayaran"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}