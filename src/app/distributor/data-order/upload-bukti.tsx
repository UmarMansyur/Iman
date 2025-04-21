/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Upload,
  Loader2,
  Image as ImageIcon,
  X,
  Package,
  CreditCard,
  Building2,
  User,
} from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import { Badge } from "@/components/ui/badge";

export default function UploadBukti({ data, fetchProducts }: { data: any, fetchProducts: any }) {
  const [open, setOpen] = useState(false);
  const [buktiPembayaran, setBuktiPembayaran] = useState(data.proof_of_payment);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleUpload = (id: number) => {
    const file = document.getElementById(`buktiPembayaran-file${id}`);
    if (file) file.click();
  };

  const handleSave = async (id: number) => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("proof_of_payment", buktiPembayaran);
      formData.append("invoice_id", id.toString());

      const response = await fetch(`/api/order-ke-pabrik`, {
        method: "PATCH",
        body: formData,
      });


      const data = await response.json();

      if (!response.ok) throw new Error(data.message);
      toast.success("Bukti pembayaran berhasil diupload");
      setOpen(false);
      await fetchProducts();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = async (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      setPreviewImage(preview);
      setBuktiPembayaran(file);
    }
  };

  const clearPreview = () => {
    setPreviewImage(null);
    setBuktiPembayaran(data.proof_of_payment);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          type="button"
          className="gap-2 hover:bg-primary hover:text-black transition-colors hover:bg-gray-100"
        >
          <Upload className="w-4 h-4" />
          Upload Bukti Pembayaran
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <DialogTitle className="text-2xl font-semibold">
            Detail Invoice
          </DialogTitle>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Nomor Invoice</p>
              <p className="font-medium">{data.invoice_code}</p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-sm text-gray-500">Tanggal</p>
              <p className="font-medium">{formatDate(data.created_at)}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-6 mt-4">
          {/* Left Column */}
          <div className="space-y-2">
            {/* Informasi Pabrik */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="w-5 h-5 text-gray-500" />
                  <h3 className="text-lg font-semibold">Informasi Pabrik</h3>
                </div>
                <div>
                  <p className="font-medium">{data.factory ? data.factory.name : "Non Pabrik"}</p>
                  <p className="text-sm text-gray-500">
                    {data.factory ? data.factory.address : "-"}
                  </p>
                </div>
              </Card>

              {/* Informasi Pembeli */}
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-5 h-5 text-gray-500" />
                  <h3 className="text-lg font-semibold">Informasi Pembeli</h3>
                </div>
                <div>
                  <p className="font-medium">{data.buyer.name}</p>
                  <p className="text-sm text-gray-500">{data.buyer.address}</p>
                </div>
              </Card>
            </div>

            {/* Detail Produk */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-gray-500" />
                  <CardTitle className="text-lg">Detail Produk</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                          Produk
                        </th>
                        <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">
                          Harga
                        </th>
                        <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">
                          Jumlah
                        </th>
                        <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">
                          Subtotal
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {data.detailInvoices.map((item: any) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3 text-sm">{item.desc}</td>
                          <td className="px-4 py-3 text-sm text-right">
                            {formatCurrency(item.price)}
                          </td>
                          <td className="px-4 py-3 text-sm text-right">
                            {item.amount} unit
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-right">
                            {formatCurrency(item.sub_total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 font-medium">
                      <tr>
                        <td colSpan={3} className="px-4 py-2 text-right">
                          Total
                        </td>
                        <td className="px-4 py-2 text-right">
                          {formatCurrency(data.total)}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={3} className="px-4 py-2 text-right">
                          Uang Muka
                        </td>
                        <td className="px-4 py-2 text-right">
                          {formatCurrency(data.down_payment)}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={3} className="px-4 py-2 text-right">
                          Sisa
                        </td>
                        <td className="px-4 py-2 text-right">
                          {formatCurrency(data.remaining_balance)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-2">
            {/* Upload Bukti */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-gray-500" />
                  <CardTitle className="text-lg flex">
                    {/* buatkan saya badge jika sudah paid dan paid_off berarti sudah valid*/}
                    Upload Bukti Pembayaran { " "}
                    {data.payment_status == "Paid" || data.payment_status == "Paid_Off" ? (
                      <Badge variant="outline" className="bg-green-500 text-white ms-2 text-xs">
                        Valid
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="ms-2 text-xs">
                        Belum Valid
                      </Badge>
                    )}
                  </CardTitle>
                </div>
                <CardDescription>
                  {data.payment_method.name} - {formatCurrency(data.total)}
                  <br />
                  <span className="text-sm text-blue-500 font-bold">
                    {" "}
                    Jumlah yang Harus Dibayar ({formatCurrency(data.down_payment)})
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 w-1/2 mx-auto">
                <div className="border-2 border-dashed rounded-lg p-4 bg-gray-50">
                  {previewImage || data.proof_of_payment ? (
                    <div className="relative w-full aspect-square">
                      <Image
                        src={previewImage || data.proof_of_payment}
                        alt="Bukti Pembayaran"
                        fill
                        className="object-contain rounded-lg"
                      />
                      {previewImage && (
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-8 w-8"
                          onClick={clearPreview}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                      <ImageIcon className="w-12 h-12 text-gray-400 mb-3" />
                      <p className="text-sm text-gray-500">
                        Belum ada bukti pembayaran
                      </p>
                    </div>
                  )}
                </div>

                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  id={`buktiPembayaran-file${data.id}`}
                  accept="image/*,application/pdf"
                />

                {previewImage ? (
                  <Button
                    className="w-full"
                    onClick={() => handleSave(data.id)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      "Simpan Bukti Pembayaran"
                    )}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    className="w-full"
                    onClick={() => handleUpload(data.id)}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Pilih File Bukti Pembayaran
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
