import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
 } from "@/components/ui/dialog";
 import { Button } from "@/components/ui/button";
 import { Eye } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
 
 /* eslint-disable @typescript-eslint/no-explicit-any */
 export default function Detail({ data }: { data: any }) {
  const transaction = data;
 
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const handleConfirmPayment = async () => {
    setLoading(true);
    const response = await fetch('/api/transaction-service/' + data.id, {
      method: 'PATCH',
      body: JSON.stringify({
        status: "Paid_Off"
      })
    });
    const responseData = await response.json();
    if (response.ok) {
      toast.success("Berhasil Konfirmasi Pembayaran");
    } else {
      toast.error(responseData.message);
    }
    queryClient.invalidateQueries({ queryKey: ['transaction-service'] });
    // close dialog
    setOpen(false);
    setLoading(false);
  };
 
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="rounded-md p-2 bg-blue-500 text-white hover:bg-blue-600 hover:text-white">
        <Eye className="w-4 h-4" />
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Transaksi</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold">Kode Transaksi</p>
              <p>{transaction.transaction_code}</p>
            </div>
            <div>
              <p className="font-semibold">Status</p>
              {
                transaction.status === "Pending" && (
                  <p className="text-yellow-600 font-medium">Menunggu Konfirmasi</p>
                )
              }
              {
                transaction.status === "Paid" && (
                  <p className="text-blue-600 font-medium">Dibayar Sebagian</p>
                )
              }
              {
                transaction.status === "Paid_Off" && (
                  <p className="text-green-600 font-medium">Lunas</p>
                )
              }
              {
                transaction.status === "Cancelled" && (
                  <p className="text-red-600 font-medium">Ditolak</p>
                )
              }
              {
                transaction.status === "Rejected" && (
                  <p className="text-red-600 font-medium">Ditolak</p>
                )
              }
            </div>
            <div>
              <p className="font-semibold">Pembeli</p>
              <p>{transaction.buyer.name}</p>
              <p className="text-gray-600 text-xs">{transaction.buyer.address}</p>
            </div>
            <div>
              <p className="font-semibold">Metode Pembayaran</p>
              <p>{transaction.payment_method.name}</p>
            </div>
          </div>
 
          <div className="border-t pt-4">
            <p className="font-semibold mb-2">Layanan</p>
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left">Nama Layanan</th>
                  <th className="px-4 py-2 text-right">Subtotal</th>
                  <th className="px-4 py-2 text-right">Jumlah x Harga</th>
                </tr>
              </thead>
              <tbody>
                {transaction.DetailTransactionService.map((item: any) => (
                  <tr key={item.id} className="border-b">
                    <td className="px-4 py-2">
                      <p className="text-gray-600">{item.desc}</p>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <p>{formatCurrency(item.subtotal)}</p>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <p className="text-xs text-gray-600">
                        {item.amount} x {formatCurrency(item.price)}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
 
          <div className="border-t pt-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <p className="font-semibold">Total Pembayaran</p>
              <p className="text-right font-semibold">{formatCurrency(transaction.amount)}</p>
              <p className="font-semibold">Uang Muka</p>
              <p className="text-right">{formatCurrency(transaction.down_payment)}</p>
              <p className="font-semibold">Sisa Pembayaran</p>
              <p className="text-right">{formatCurrency(transaction.remaining_balance)}</p>
              <p className="font-semibold">Jatuh Tempo</p>
              <p className="text-right">{new Date(transaction.maturity_date).toLocaleDateString('id-ID')}</p>
            </div>
          </div>
          <div>
            <p className="font-semibold">Catatan</p>
            <p>{transaction.desc}</p>
          </div>
          {
            transaction.payment_proof && (
              <div>
                <p className="font-semibold">Bukti Pembayaran</p>
                <Image src={transaction.payment_proof} alt="Bukti Pembayaran" width={100} height={100} />
            </div>
          )}
          {/* buat inputan untuk status */}
          {/* <div>
            <p className="font-semibold">Status Pembayaran</p>
            <Input type="text" placeholder="Status" />
          </div> */}
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" type="button">
            Batal
          </Button>
          <Button type="button" className="bg-blue-600 hover:bg-blue-700" onClick={handleConfirmPayment} disabled={loading}>
            {loading ? "Loading..." : "Konfirmasi Pembayaran"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
 }