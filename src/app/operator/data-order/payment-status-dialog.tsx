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
import { Textarea } from "@/components/ui/textarea";

export default function PaymentStatusDialog({ invoice, fetchData }: any) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(invoice.payment_status);
  const [amount, setAmount] = useState("");
  const [isValidAmount, setIsValidAmount] = useState(true);
  const [buyerAddress, setBuyerAddress] = useState(invoice.buyer_address || "");
  const [discount, setDiscount] = useState(invoice.discount?.toString() || "");
  const [memberDiscount, setMemberDiscount] = useState(invoice.member_discount?.toString() || "");
  const [deliveryLocation, setDeliveryLocation] = useState(invoice.deliveryTracking?.location || "");
  const [deliveryCost, setDeliveryCost] = useState(invoice.deliveryTracking?.cost?.toString() || "");

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

  const isDataComplete = () => {
    if (status === "Paid" || status === "Paid_Off") {
      return (
        buyerAddress.trim() !== "" &&
        discount.trim() !== "" &&
        memberDiscount.trim() !== "" &&
        deliveryLocation.trim() !== "" &&
        deliveryCost.trim() !== ""
      );
    }
    return true;
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/transaction/status?id=${invoice.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
            buyer_address: buyerAddress,
            discount: parseFloat(discount),
            member_discount: parseFloat(memberDiscount),
            delivery_location: deliveryLocation,
            delivery_cost: parseFloat(deliveryCost),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) throw new Error(data.message);

      toast.success("Status pembayaran berhasil diubah");
      fetchData();
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
          <CreditCard className="w-4 h-4" /> Validasi Pembayaran
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[900px] max-h-[90vh] overflow-y-auto">
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
            <p className="font-medium">{invoice.buyer}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Invoice</p>
            <p className="font-medium">Rp {invoice.total.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Sisa Pembayaran</p>
            <p className="font-medium">
              Rp {invoice.remaining_balance.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Tanggal Jatuh Tempo</p>
            <p className="font-medium">
              {new Date(invoice.maturity_date).toLocaleDateString("id-ID")}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Metode Pembayaran</p>
            <p className="font-medium">{invoice.payment_method?.name}</p>
          </div>
        </div>

        <div className="border p-4 rounded-lg mb-4">
          <p className="font-medium mb-2">Detail Produk:</p>
          {invoice.detailInvoices.map((detail: any, index: number) => (
            <div key={index} className="flex justify-between text-sm">
              <span>
                {detail.desc} (x{detail.amount})
              </span>
              <span>Rp {detail.sub_total.toLocaleString()}</span>
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
                <SelectItem value="Cancelled">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(status === "Paid" || status === "Paid_Off") && (
            <>
              <div className="space-y-2">
                <Label>Alamat Pembeli</Label>
                <Textarea
                  value={buyerAddress}
                  onChange={(e) => setBuyerAddress(e.target.value)}
                  placeholder="Masukkan alamat pembeli"
                  className={!buyerAddress ? "border-red-500" : ""}
                />
                {!buyerAddress && (
                  <p className="text-sm text-red-500">Alamat pembeli harus diisi</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Diskon</Label>
                  <Input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    placeholder="Masukkan diskon"
                    className={!discount ? "border-red-500" : ""}
                  />
                  {!discount && (
                    <p className="text-sm text-red-500">Diskon harus diisi</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Diskon Member</Label>
                  <Input
                    type="number"
                    value={memberDiscount}
                    onChange={(e) => setMemberDiscount(e.target.value)}
                    placeholder="Masukkan diskon member"
                    className={!memberDiscount ? "border-red-500" : ""}
                  />
                  {!memberDiscount && (
                    <p className="text-sm text-red-500">Diskon member harus diisi</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Lokasi Pengiriman</Label>
                <Input
                  value={deliveryLocation}
                  onChange={(e) => setDeliveryLocation(e.target.value)}
                  placeholder="Masukkan lokasi pengiriman"
                  className={!deliveryLocation ? "border-red-500" : ""}
                />
                {!deliveryLocation && (
                  <p className="text-sm text-red-500">Lokasi pengiriman harus diisi</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Biaya Pengiriman</Label>
                <Input
                  type="number"
                  value={deliveryCost}
                  onChange={(e) => setDeliveryCost(e.target.value)}
                  placeholder="Masukkan biaya pengiriman"
                  className={!deliveryCost ? "border-red-500" : ""}
                />
                {!deliveryCost && (
                  <p className="text-sm text-red-500">Biaya pengiriman harus diisi</p>
                )}
              </div>
            </>
          )}

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
            disabled={
              loading || 
              (status === "Paid_Off" && !isValidAmount) || 
              !isDataComplete()
            } 
            className="w-full"
          >
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
