/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import MainPage from "@/components/main";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { Plus, Trash2, RotateCcw, ArrowLeft, Loader2 } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { useUserStore } from "@/store/user-store";

interface DetailOrder {
  material_unit_id: string;
  amount: number;
  price: number;
  total: number;
}

export default function OrderPage() {
  const params = useParams();
  const router = useRouter();
  const [details, setDetails] = useState<DetailOrder[]>([]);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentMaterial, setCurrentMaterial] = useState("");
  const [currentAmount, setCurrentAmount] = useState<string>("");
  const [currentPrice, setCurrentPrice] = useState<string>("");
  const [currentTotal, setCurrentTotal] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  const formatNumber = (value: string) => {
    const number = value.replace(/\D/g, "");
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const addDetail = () => {
    if (!currentMaterial) {
      toast.error("Pilih material terlebih dahulu");
      return;
    }
    if (!currentAmount || Number(currentAmount) <= 0) {
      toast.error("Jumlah harus lebih dari 0");
      return;
    }
    if (!currentPrice || Number(currentPrice) <= 0) {
      toast.error("Harga harus lebih dari 0");
      return;
    }

    const existingDetailIndex = details.findIndex(
      (detail) => detail.material_unit_id == currentMaterial
    );


    if (existingDetailIndex !== -1) {
      // Jika material sudah ada, update jumlahnya
      const updatedDetails = [...details];
      const newAmount =
        updatedDetails[existingDetailIndex].amount +
        Number(currentAmount.replace(/,/g, ""));
      updatedDetails[existingDetailIndex] = {
        ...updatedDetails[existingDetailIndex],
        amount: newAmount,
        total: newAmount * updatedDetails[existingDetailIndex].price,
      };
      setDetails(updatedDetails);
    } else {
      // Jika material belum ada, tambahkan sebagai item baru
      setDetails([
        ...details,
        {
          material_unit_id: currentMaterial,
          amount: Number(currentAmount.replace(/,/g, "")),
          price: Number(currentPrice.replace(/,/g, "")),
          total:
            Number(currentAmount.replace(/,/g, "")) *
            Number(currentPrice.replace(/,/g, "")),
        },
      ]);
    }

    // setDetails([
    //   ...details,
    //   {
    //     material_unit_id: currentMaterial,
    //     amount: Number(currentAmount.replace(/,/g, "")),
    //     price: Number(currentPrice.replace(/,/g, "")),
    //     total:
    //       Number(currentAmount.replace(/,/g, "")) *
    //       Number(currentPrice.replace(/,/g, "")),
    //   },
    // ]);

    setCurrentMaterial("");
    setCurrentAmount("");
    setCurrentPrice("");
    setCurrentTotal("");
  };

  useEffect(() => {
    const amount = Number(currentAmount.replace(/,/g, ""));
    const price = Number(currentPrice.replace(/,/g, ""));
    setCurrentTotal(
      Number(amount * price).toLocaleString("id-ID", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
    );
  }, [currentAmount, currentPrice]);
  const { user } = useUserStore();
  const [materials, setMaterials] = useState<any[]>([]);
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const response = await fetch("/api/material-unit?limit=1000&page=1&factory_id=" + user?.factory_selected?.id);
        const data = await response.json();
        setMaterials(data.data);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMaterials();
  }, [user?.factory_selected?.id]);

  const removeDetail = (index: number) => {
    const newDetails = details.filter((_, i) => i !== index);
    setDetails(newDetails);
  };

  const grandTotal = details.reduce((sum, detail) => sum + detail.total, 0);

  useEffect(() => {
    const fetchOrder = async () => {
      const orderId = params?.id;
      if (!orderId) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/order/${orderId}`);
        const data = await response.json();

        if (!response.ok) throw new Error(data.error);

        setDescription(data.desc);
        setDetails(
          data.DetailOrderMaterialUnit.map((detail: any) => ({
            material_unit_id: detail.material_unit_id,
            amount: detail.amount,
            price: detail.price,
            total: detail.amount * detail.price,
          }))
        );
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [params?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const orderId = params?.id;
      const payload = {
        factory_id: 1,
        desc: description,
        user_id: user?.id,
        details: details.map((detail) => ({
          material_unit_id: detail.material_unit_id,
          amount: detail.amount,
          price: detail.price,
        })),
      };

      const url = orderId ? `/api/order/${orderId}` : "/api/order";
      const method = orderId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setDetails([]);
      toast.success(
        orderId ? "Order berhasil diupdate" : "Order berhasil dibuat"
      );
      router.push("/owner/persediaan-bahan-baku");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setDetails([]);
    setDescription("");
  };

  if (isLoading) {
    return (
      <MainPage>
        <div className="h-[50vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="text-gray-500">Memuat data...</p>
          </div>
        </div>
      </MainPage>
    );
  }

  return (
    <MainPage>
      <div className="container mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  {params?.id ? "Edit Data Order" : "Tambah Data Order"}
                </h3>
                <Button
                  type="button"
                  className="bg-white border border-gray-300 hover:bg-gray-100 text-black"
                  onClick={() => router.back()}
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Kembali
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-2">
                <label>Deskripsi</label>
                <Textarea
                  placeholder="Masukkan deskripsi order"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-5 gap-4 items-end">
                <div className="grid gap-2">
                  <label>Material</label>
                  <Select
                    value={currentMaterial}
                    onValueChange={setCurrentMaterial}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Material">
                        {
                          materials.find((m) => m.id == currentMaterial)
                            ?.material
                        }
                        {materials.find((m) => m.id == currentMaterial)
                          ? " / "
                          : ""}
                        {materials.find((m) => m.id == currentMaterial)?.unit}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {materials.map((material) => (
                        <SelectItem key={material.id} value={material.id}>
                          {material.material} / {material.unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <label>Jumlah</label>
                  <Input
                    type="text"
                    value={currentAmount}
                    onChange={(e) => {
                      const value = e.target.value.replace(/,/g, "");
                      if (/^\d*$/.test(value) || value === "") {
                        setCurrentAmount(formatNumber(value));
                      }
                    }}
                    placeholder="Jumlah"
                  />
                </div>
                <div className="grid gap-2">
                  <label>Harga</label>
                  <Input
                    type="text"
                    value={currentPrice}
                    onChange={(e) => {
                      const value = e.target.value.replace(/,/g, "");
                      if (/^\d*$/.test(value) || value === "") {
                        setCurrentPrice(formatNumber(value));
                      }
                    }}
                    placeholder="Harga per unit"
                  />
                </div>
                <div className="grid gap-2">
                  <label>Total</label>
                  <Input type="text" value={currentTotal || ""} disabled />
                </div>
                <Button
                  type="button"
                  onClick={addDetail}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Tambah
                </Button>
              </div>

              <div className="border rounded-lg">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left">Material</th>
                      <th className="px-4 py-2 text-left">Jumlah</th>
                      <th className="px-4 py-2 text-left">Harga</th>
                      <th className="px-4 py-2 text-left">Total</th>
                      <th className="px-4 py-2 text-left">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {details.map((detail, index) => (
                      <tr key={index} className="border-t">
                        <td className="px-4 py-2">
                          {
                            materials.find(
                              (m) => m.id == detail.material_unit_id
                            )?.material
                          }{" "}
                          /
                          {
                            materials.find(
                              (m) => m.id == detail.material_unit_id
                            )?.unit
                          }
                        </td>
                        <td className="px-4 py-2">
                          {formatNumber(detail.amount.toString())}
                        </td>
                        <td className="px-4 py-2">
                          Rp {formatNumber(detail.price.toString())}
                        </td>
                        <td className="px-4 py-2">
                          Rp {formatNumber(detail.total.toString())}
                        </td>
                        <td className="px-4 py-2">
                          <Button
                            type="button"
                            variant="destructive"
                            onClick={() => removeDetail(index)}
                            size="sm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {!details.length && (
                      <tr>
                        <td colSpan={5} className="text-center py-10">
                          Tidak ada data
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center border p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-medium">Total Keseluruhan</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-lg font-medium">Rp</span>
                  <span className="font-bold text-4xl tracking-tight">
                    {grandTotal.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              <div className="flex justify-between">
                <div className="space-x-2">
                  <Button
                    type="button"
                    className="bg-white border border-gray-300 hover:bg-gray-100 text-black"
                    onClick={handleReset}
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Reset
                  </Button>
                </div>
                <Button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Order"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainPage>
  );
}
