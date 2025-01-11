/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import MainPage from "@/components/main";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Trash2,
  RotateCcw,
  ArrowLeft,
  Save,
  Loader2,
  ShoppingCart,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useUserStore } from "@/store/user-store";
import EmptyData from "@/components/views/empty-data";
import { TableCell } from "@/components/ui/table";
import { formatNumber } from "@/utils/format";
interface DetailOrder {
  material_unit_id: string;
  amount: number;
  price: number;
  sub_total: number;
}

export default function OrderPage() {
  const [details, setDetails] = useState<DetailOrder[]>([]);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [price, setPrice] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  const router = useRouter();

  const [currentMaterial, setCurrentMaterial] = useState("");
  const [currentAmount, setCurrentAmount] = useState<string>("");

  const addDetail = () => {
    if (!currentMaterial) {
      toast.error("Pilih bahan baku terlebih dahulu");
      return;
    }
    if (!currentAmount || Number(currentAmount) <= 0) {
      toast.error("Jumlah harus lebih dari 0");
      return;
    }

    const existingDetail = details.find(
      (detail) => detail.material_unit_id === currentMaterial
    );
    if (existingDetail) {
      toast.error(
        "Bahan baku sudah ada dalam keranjang, silahkan edit data yang sudah ada!"
      );
      return;
    }
    setDetails([
      ...details,
      {
        material_unit_id: currentMaterial,
        amount: Number(currentAmount.replace(/,/g, "")),
        price: Number(`${price}`.replace(/,/g, "")),
        sub_total: Number(`${totalPrice}`.replace(/,/g, "")),
      },
    ]);

    setCurrentMaterial("");
    setCurrentAmount("");
    setPrice(0);
    setTotalPrice(0);
  };

  const [materials, setMaterials] = useState<any[]>([]);
  const { user } = useUserStore();
  useEffect(() => {
    const fetchMaterials = async () => {
      const response = await fetch("/api/material-unit?limit=1000&page=1&factory_id=" + user?.factory_selected?.id);
      const data = await response.json();
      setMaterials(data.data);
    };
    fetchMaterials();
  }, [user?.factory_selected?.id]);

  const removeDetail = (index: number) => {
    const newDetails = details.filter((_, i) => i !== index);
    setDetails(newDetails);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        factory_id: user?.factory_selected?.id,
        desc: description,
        user_id: user?.id,
        price: 0,
        type_preorder: false,
        details: details.map((detail) => ({
          material_unit_id: detail.material_unit_id,
          amount: detail.amount,
          price: detail.price,
        })),
      };

      const response = await fetch("/api/entry-persediaan-bahan-baku", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setDetails([]);
      toast.success("Order berhasil dibuat");
      router.push("/operator/persediaan-bahan-baku");
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

  // format idr
  const formatIdr = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    })
      .format(value)
      .replace(/,/g, ".")
      .slice(0, -3);
  };

  return (
    <MainPage>
      <div className="container mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Entry Bahan Baku</h3>
                <Button
                  type="button"
                  className="bg-gray-400 hover:bg-gray-500 text-white shadow-sm shadow-gray-400/50"
                  onClick={() => router.push("/operator/persediaan-bahan-baku")}
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Kembali
                </Button>
              </div>
            </CardTitle>
            <CardDescription>
              <p>
                Entry bahan baku, pastikan data yang sudah diinputkan telah
                benar. Form inputan tidak dapat diedit dan dihapus setelah order
                dibuat. Alternatifnya silahkan hubungi owner untuk mengubah
                data.
              </p>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-2">
                <label>Deskripsi:</label>
                <Textarea
                  placeholder="Masukkan deskripsi order bahan baku"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  // error jika tidak diisi
                  aria-invalid={!description}
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
                      <SelectValue placeholder="Pilih Bahan Baku">
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
                        const amountInput = value.replace(/,/g, "");
                        setTotalPrice(
                          Number(`${price}`.replace(/,/g, "")) *
                            Number(amountInput)
                        );
                      }
                    }}
                    placeholder="Jumlah"
                  />
                </div>
                <div className="grid gap-2">
                  <label>Harga</label>
                  <Input
                    type="text"
                    value={price || ""}
                    onChange={(e) => {
                      const value = e.target.value.replace(/,/g, "");
                      if (/^\d*$/.test(value) || value === "") {
                        setPrice(formatNumber(`${value}`));
                        const priceInput = value.replace(/,/g, "");
                        const amountInput = currentAmount.replace(/,/g, "");
                        setTotalPrice(Number(priceInput) * Number(amountInput));
                      }
                    }}
                    placeholder="Rp. 0"
                  />
                </div>
                <div className="grid gap-2">
                  <label>Sub Total</label>
                  <Input
                    type="text"
                    value={formatIdr(totalPrice)}
                    placeholder="Rp. 0"
                    disabled
                  />
                </div>
                <Button
                  type="button"
                  onClick={addDetail}
                  variant="outline"
                >
                  <ShoppingCart className="w-4 h-4 mr-1" />
                  Tambah
                </Button>
              </div>
              <h1 className="text-lg font-semibold">Detail Order</h1>
              <div className="border rounded-lg">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left">Material</th>
                      <th className="px-4 py-2 text-left">Jumlah</th>
                      <th className="px-4 py-2 text-left">Harga</th>
                      <th className="px-4 py-2 text-left">Sub Total</th>
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
                          {formatIdr(detail.price)}
                        </td>
                        <td className="px-4 py-2">
                          {formatIdr(detail.sub_total)}
                        </td>
                        <td className="px-4 py-2">
                          <Button
                            type="button"
                            variant="destructive"
                            onClick={() => removeDetail(index)}
                            size="sm"
                            className="bg-danger2 hover:bg-danger2/80 hover:shadow-danger2/60 hover:text-white"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {!details.length && (
                      <tr>
                        <TableCell colSpan={5} className="h-24 text-center">
                          <EmptyData text="Keranjang kosong" />
                        </TableCell>
                      </tr>
                    )}
                  </tbody>
                </table>
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
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 mr-1" />
                  ) : (
                    <Save className="w-4 h-4 mr-1" />
                  )}
                  {isSubmitting ? "Sedang menyimpan..." : "Simpan Order"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainPage>
  );
}
