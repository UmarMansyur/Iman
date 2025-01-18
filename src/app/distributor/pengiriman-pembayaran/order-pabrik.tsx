/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
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
  Box,
  Building,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUserStore } from "@/store/user-store";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Product {
  id: number;
  factory_id: number | null;
  name: string;
  type: string;
  price: number;
  factory: {
    id: number;
    nickname: string;
    name: string;
    logo: string | null;
    address: string;
    user_id: number;
    status: string;
    created_at: string;
    updated_at: string;
  } | null;
}

interface DetailTransaction {
  id: number;
  transaction_distributor_id: number;
  desc: string;
  amount: number;
  price: number;
  discount: number;
  sale_price: number;
  is_product: boolean;
  product_id: number;
  created_at: string;
  updated_at: string;
  Product: Product;
}

interface Transaction {
  id: number;
  invoice_code: string;
  DetailTransactionDistributor: DetailTransaction[];
}

const transactions: Transaction[] = [
  // ...data JSON Anda
];

const groupedByFactory = transactions.map((transaction) => {
  const groupedProducts: { [key: number]: DetailTransaction[] } = {};

  transaction.DetailTransactionDistributor.forEach((detail) => {
    const factoryId = detail.Product.factory_id || 0; // Gunakan 0 jika factory_id null
    if (!groupedProducts[factoryId]) {
      groupedProducts[factoryId] = [];
    }
    groupedProducts[factoryId].push(detail);
  });

  return {
    invoice_code: transaction.invoice_code,
    groupedProducts,
  };
});

// Tambahkan fungsi untuk mengelompokkan produk per pabrik
const groupProductsByFactory = (details: DetailTransaction[]) => {
  const grouped: { [key: string]: any } = {};

  details.forEach((detail) => {
    const factoryId = detail.Product.factory_id || "other";
    const factoryName = detail.Product.factory?.name || "Produk Tanpa Pabrik";

    if (!grouped[factoryId]) {
      grouped[factoryId] = {
        factory: {
          id: factoryId,
          name: factoryName,
        },
        products: [],
      };
    }

    grouped[factoryId].products.push(detail);
  });

  return grouped;
};

interface PaymentData {
  factoryId: string | number;
  downPayment: string;
  paymentMethod: string;
  file: File | null;
}

export default function TransactionDialog({
  invoice,
  products,
  metodePembayaran,
}: {
  invoice: any;
  products: any;
  metodePembayaran: any;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [descDelivery, setDescDelivery] = useState<string>("");

  // State baru untuk menyimpan data pembayaran per pabrik
  const [paymentsData, setPaymentsData] = useState<PaymentData[]>([]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    })
      .format(value)
      .slice(0, -3);
  };

  const formatNumber = (value: string) => {
    const number = value.replace(/\D/g, "");
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleFileChange =
    (factoryId: string | number) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        const selectedFile = e.target.files[0];
        if (
          !["image/jpeg", "image/png", "application/pdf"].includes(
            selectedFile.type
          )
        ) {
          toast.error("Format file harus JPG, PNG, atau PDF");
          return;
        }
        if (selectedFile.size > 5 * 1024 * 1024) {
          toast.error("Ukuran file maksimal 5MB");
          return;
        }

        setPaymentsData((prev) => {
          const existing = prev.find((p) => p.factoryId === factoryId);
          if (existing) {
            return prev.map((p) =>
              p.factoryId === factoryId ? { ...p, file: selectedFile } : p
            );
          }
          return [
            ...prev,
            {
              factoryId,
              file: selectedFile,
              downPayment: "",
              paymentMethod: "",
            },
          ];
        });
      }
    };

  const handleDownPaymentChange =
    (factoryId: string | number) => (value: string) => {
      setPaymentsData((prev) => {
        const existing = prev.find((p) => p.factoryId === factoryId);
        if (existing) {
          return prev.map((p) =>
            p.factoryId === factoryId ? { ...p, downPayment: value } : p
          );
        }
        return [
          ...prev,
          { factoryId, downPayment: value, paymentMethod: "", file: null },
        ];
      });
    };

  const handlePaymentMethodChange =
    (factoryId: string | number) => (value: string) => {
      setPaymentsData((prev) => {
        const existing = prev.find((p) => p.factoryId === factoryId);
        if (existing) {
          return prev.map((p) =>
            p.factoryId === factoryId ? { ...p, paymentMethod: value } : p
          );
        }
        return [
          ...prev,
          { factoryId, paymentMethod: value, downPayment: "", file: null },
        ];
      });
    };

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const parentFormData = new FormData();
      const payload: any[] = [];

      await Promise.all(
        paymentsData.map(async (payment) => {
          // const formData = new FormData();
          // formData.append("payment_proof", payment.file || "");
          // formData.append("transaction_distributor_id", invoice.id.toString());
          // formData.append(
          //   "down_payment",
          //   payment.downPayment.replace(/\./g, "")
          // );
          // formData.append("payment_method_id", payment.paymentMethod);
          // formData.append("desc_delivery", descDelivery);
          // formData.append("user_id", user?.id.toString() || "");
          // formData.append("factory_id", payment.factoryId.toString());
          payload.push({
            payment_proof: payment.file || "",
            transaction_distributor_id: invoice.id.toString(),
            down_payment: payment.downPayment.replace(/\./g, ""),
            payment_method_id: payment.paymentMethod,
            desc_delivery: descDelivery,
            user_id: user?.id.toString() || "",
            factory_id: payment.factoryId.toString(),
          });

          // const response = await fetch("/api/order-ke-pabrik", {
          //   method: "POST",
          //   body: formData,
          // });

          // return response.json();
        })
      );


      console.log(payload);

      parentFormData.append("payload", JSON.stringify(payload));

      const response = await fetch("/api/order-ke-pabrik", {
        method: "POST",
        body: parentFormData,
      });

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transaksi-distributor"] });
      toast.success("Bukti pembayaran berhasil diunggah");
      setOpen(false);
      setUploadProgress(0);
    },
    onError: (error: Error) => {
      toast.error(error.message);
      setUploadProgress(0);
    },
  });

  const { user } = useUserStore();

  // Di dalam render, gunakan state yang baru
  const getPaymentData = (factoryId: string | number) =>
    paymentsData.find((p) => p.factoryId === factoryId) || {
      downPayment: "",
      paymentMethod: "",
      file: null,
    };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="w-full flex items-center justify-start text-sm py-2 hover:bg-gray-50 px-2 font-medium">
        <Box className="w-4 h-4 mr-2" /> Order ke Pabrik
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Receipt className="w-6 h-6" />
            Detail Invoice {invoice.invoice_code} - Order ke Pabrik
          </DialogTitle>
          <DialogDescription>
            Masukkan detail pembayaran dan unggah bukti pembayaran untuk setiap pabrik
          </DialogDescription>
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
                    <Label className="text-sm text-gray-500">
                      Nama Pembeli
                    </Label>
                    <p className="font-medium">{invoice.buyer.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Alamat</Label>
                    <p className="font-medium">{invoice.buyer.address}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <Label className="text-sm text-gray-500">
                      Status Pembayaran
                    </Label>
                    <Badge
                      variant={
                        invoice.status_payment === "Paid_Off"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {invoice.status_payment === "Paid_Off"
                        ? "Lunas"
                        : invoice.status_payment === "Paid"
                        ? "Dibayar Sebagian"
                        : invoice.status_payment === "Failed"
                        ? "Gagal"
                        : invoice.status_payment}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <Label className="text-sm text-gray-500">
                      Status Pengiriman
                    </Label>
                    <Badge
                      variant={
                        invoice.status_delivery === "Process"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {invoice.status_delivery}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">
                      Metode Pembayaran
                    </Label>
                    <p className="font-medium">{invoice.payment_method.name}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <Label className="text-sm text-gray-500">
                      Catatan Pengiriman
                    </Label>
                    <p className="font-medium">
                      {invoice.desc_delivery || "-"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detail Produk Per Pabrik */}
            {Object.entries(
              groupProductsByFactory(invoice.DetailTransactionDistributor)
            ).map(([factoryId, factoryData]: [string, any]) => (
              <Card key={factoryId}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    {factoryData.factory.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative overflow-x-auto">
                    <table className="w-full text-sm text-left rtl:text-right">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3">
                            Produk
                          </th>
                          <th scope="col" className="px-6 py-3 text-center">
                            Jumlah (Pack)
                          </th>
                          <th scope="col" className="px-6 py-3 text-end">
                            Harga Distributor
                          </th>
                          <th scope="col" className="px-6 py-3 text-end">
                            Harga Pabrik
                          </th>
                          <th scope="col" className="px-6 py-3 text-end">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {factoryData.products.map(
                          (item: any, index: number) => (
                            <tr key={index} className="bg-white border-b">
                              <td className="px-6 py-4">{item.desc}</td>
                              <td className="px-6 py-4 text-center">
                                {item.amount}
                              </td>
                              <td className="px-6 py-4 text-end">
                                {formatCurrency(item.price)}
                              </td>
                              <td className="px-6 py-4 text-end">
                                {formatCurrency(item.Product.price)}
                              </td>
                              <td className="px-6 py-4 text-end">
                                {formatCurrency(
                                  item.Product.price * item.amount
                                )}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                      <tfoot>
                        <tr className="font-semibold text-gray-900">
                          <td colSpan={4} className="px-6 py-3 text-right">
                            Total untuk {factoryData.factory.name}
                          </td>
                          <td className="px-6 py-3 text-end">
                            {formatCurrency(
                              factoryData.products.reduce(
                                (total: number, item: any) =>
                                  total +
                                  item.Product.price * item.amount,
                                0
                              )
                            )}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* Form Pembayaran per Pabrik */}
                  <div className="mt-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <Label>
                          Uang Muka untuk {factoryData.factory.name}{" "}
                          <sup className="text-red-500">*</sup>
                        </Label>
                        <Input
                          type="text"
                          value={formatNumber(
                            getPaymentData(factoryId).downPayment
                          )}
                          onChange={(e) =>
                            handleDownPaymentChange(factoryId)(
                              formatNumber(e.target.value)
                            )
                          }
                          placeholder="Masukkan jumlah uang muka"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>
                          Sisa Pembayaran <sup className="text-red-500">*</sup>
                        </Label>
                        <Input
                          type="text"
                          value={formatCurrency(
                            factoryData.products.reduce(
                              (total: number, item: any) =>
                                total + item.Product.price * item.amount,
                              0
                            ) -
                              Number(
                                getPaymentData(factoryId).downPayment.replace(
                                  /\./g,
                                  ""
                                )
                              )
                          )}
                          disabled
                          className="font-mono"
                        />
                      </div>
                    </div>

                    {/* Metode Pembayaran dan Upload Bukti per Pabrik */}
                    <div className="space-y-4">
                      <div className="flex flex-col gap-2">
                        <Label>
                          Metode Pembayaran{" "}
                          <sup className="text-red-500">*</sup>
                        </Label>
                        <Select
                          value={getPaymentData(factoryId).paymentMethod}
                          onValueChange={(value) =>
                            handlePaymentMethodChange(factoryId)(value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih Metode Pembayaran" />
                          </SelectTrigger>
                          <SelectContent>
                            {metodePembayaran.map((item: any) => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>
                          Upload Bukti Pembayaran untuk{" "}
                          {factoryData.factory.name}:{" "}
                        </Label>
                        <Input
                          type="file"
                          accept=".jpg,.jpeg,.png,.pdf"
                          onChange={handleFileChange(factoryId)}
                          className="cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Tombol simpan tunggal di luar loop */}
            <div className="sticky bottom-0 bg-white p-4 border-t">
              <Button
                onClick={() => mutation.mutate()}
                disabled={loading}
                className="w-full"
              >
                {loading
                  ? "Memproses..."
                  : "Simpan & Upload Semua Bukti Pembayaran"}
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
