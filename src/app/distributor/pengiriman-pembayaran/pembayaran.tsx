/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { CreditCard } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function PembayaranDialog({ invoice }: any) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(invoice.payment_status);
  const [amount, setAmount] = useState("");
  const [isValidAmount, setIsValidAmount] = useState(true);

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

  const handleChangeStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/distributor/pembayaran`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: invoice.id,
            status_payment: status,
            amount_payment: parseFloat(amount.replace(/\./g, "")),
          }),
        }
      );
      if (!response.ok) throw new Error("Gagal mengubah status");
      setOpen(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: handleChangeStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transaksi-distributor"] });
    },
  });

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await mutation.mutateAsync();
      toast.success("Status pembayaran berhasil diubah");
      setOpen(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full justify-start px-2">
          <CreditCard className="w-4 h-4" /> Ubah Status Pembayaran
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detail Invoice & Status Pembayaran</DialogTitle>
          <DialogDescription>
            Ubah status pembayaran dan jumlah pembayaran
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 border p-4 rounded-lg mb-4">
          <div>
            <p className="text-sm text-gray-500">Kode Invoice</p>
            <p className="font-medium">{invoice.invoice_code}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Pembeli</p>
            <p className="font-medium">{invoice.buyer?.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Invoice</p>
            <p className="font-medium">Rp {invoice.amount.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Sisa Pembayaran</p>
            <p className="font-medium">
              Rp {invoice.remaining_balance.toLocaleString()}
            </p>
          </div>
         
          <div>
            <p className="text-sm text-gray-500">Metode Pembayaran</p>
            <p className="font-medium">{invoice.payment_method?.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Pembayaran</p>
            <p className="font-medium">Rp {invoice.amount.toLocaleString()}</p>
          </div>
        </div>

        <div className="border p-4 rounded-lg mb-4">
          <p className="font-medium mb-2">Detail Produk:</p>
          {invoice.DetailTransactionDistributor.map((detail: any, index: number) => (
            <div key={index} className="flex justify-between text-sm">
              <span>
                {detail.desc} (x{detail.amount})
              </span>
              <span>Rp {detail.price.toLocaleString()}</span>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Status Pembayaran</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Paid">Dibayar</SelectItem>
                <SelectItem value="Paid_Off">Lunas</SelectItem>
                <SelectItem value="Failed">Gagal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {status === "Paid_Off" && (
            <div className="space-y-2">
              <Label>Jumlah Pelunasan Pembayaran</Label>
              <Input
                type="text"
                value={amount}
                onChange={handleAmountChange}
                placeholder="Masukkan jumlah pembayaran"
                className={!isValidAmount ? "border-red-500" : ""}
              />
              {!isValidAmount && (
                <p className="text-sm text-red-500">
                  Jumlah harus sama dengan sisa pembayaran (Rp {invoice.remaining_balance.toLocaleString()})
                </p>
              )}
            </div>
          )}

          <Button 
            onClick={handleSubmit} 
            disabled={loading || (status === "Paid" && !isValidAmount)} 
            className="w-full"
          >
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
