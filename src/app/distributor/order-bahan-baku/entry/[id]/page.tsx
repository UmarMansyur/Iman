/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import MainPage from "@/components/main";
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
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useUserStore } from "@/store/user-store";
import {
  formatNumberWithComma,
  formatWithComma,
  parseFormattedNumber,
} from "@/utils/format";
import EmptyData from "@/components/views/empty-data";

export default function OrderPage() {
  const [details, setDetails] = useState<any[]>([]);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [price, setPrice] = useState("");
  const [totalPrice, setTotalPrice] = useState("");
  const { id } = useParams();
  const [subTotal, setSubTotal] = useState("");

  const router = useRouter();

  const [currentMaterial, setCurrentMaterial] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");

  const calculateTotal = (amount: string, price: string) => {
    const numAmount = parseFormattedNumber(amount || "0");
    const numPrice = parseFormattedNumber(price || "0");
    const result = Number(numAmount) * Number(numPrice);
    setSubTotal(result.toString());
    return result;
  };

  const toNumber = (value: string) => {
    return Number(value.replace(/\./g, "").replace(/,/g, "."));
  };

  const addDetail = () => {
    if (!currentMaterial) {
      toast.error("Pilih bahan baku terlebih dahulu");
      return;
    }

    if (!currentAmount || parseFormattedNumber(currentAmount) <= 0) {
      toast.error("Jumlah harus lebih dari 0");
      return;
    }


    const amount = toNumber(currentAmount.toString());
    const currentPrice = toNumber(price.toString());
    const subTotal = amount * currentPrice;

    const existingDetailIndex = details.find(
      (detail) => detail.material_distributor_id == currentMaterial
    );

    
    if(existingDetailIndex) {
      toast.error("Bahan baku sudah ada dalam keranjang, silahkan edit data yang sudah ada!");
      return;
    }

    setDetails([
      ...details,
      {
        material_distributor_id: currentMaterial,
        amount: amount,
        price: currentPrice,
        sub_total: subTotal,
      },
    ]);

    setCurrentMaterial("");
    setCurrentAmount("");
    setPrice("");
    setTotalPrice("");
  };

  const { user } = useUserStore();
  const [materials, setMaterials] = useState<any[]>([]);
  const [factory, setFactory] = useState("");

  const fetchMaterials = async () => {
    if (!user) return;
    const queryParams = new URLSearchParams({
      page: "1",
      limit: "1000",
      user_id: user?.id || "",
    });

    const response = await fetch(`/api/distributor/bahan-baku?${queryParams}`);
    const data = await response.json();
    setMaterials(data.data);
  };

  useEffect(() => {
    fetchMaterials();
  }, [user?.id]);

  useEffect(() => {
    console.log(materials);
  }, [materials]);

  const [data, setData] = useState<any>(null);

  const getDataOrder = async (id: string) => {
    const response = await fetch(`/api/distributor/order-bahan-baku/${id}`);
    const data = await response.json();
    setData(data.data);
    setFactory(data.data.factory || "");
    setDescription(data.data.desc || "");
    setDetails(
      data.data.DetailOrderBahanBakuDistributor.map((detail: any) => ({
        material_distributor_id: detail.material_distributor_id,
        amount: detail.amount,
        price: detail.price,
        sub_total: detail.sub_total,
      }))
    );
  };

  useEffect(() => {
    getDataOrder(id as string);
  }, [id]);

  const removeDetail = (index: number) => {
    const newDetails = details.filter((_, i) => i !== index);
    setDetails(newDetails);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        desc: description,
        name: factory,
        user_id: user?.id,
        type_preorder: false,
        details: details.map((detail: any) => ({
          material_distributor_id: detail.material_distributor_id,
          amount: detail.amount,
          price: detail.price,
          sub_total: detail.sub_total,
        })),
      };

      const response = await fetch(`/api/distributor/order-bahan-baku/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setDetails([]);

      toast.success("Update order bahan baku berhasil");
      router.push("/distributor/order-bahan-baku");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setDetails([]);
    setDescription("");
    setCurrentMaterial("");
    setCurrentAmount("");
    setPrice("");
    setTotalPrice("");
  };

  return (
    <MainPage>
      <div className="mx-auto w-full">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Entry Bahan Baku</h3>
          <Button
            type="button"
            className="bg-gray-400 hover:bg-gray-500 text-white shadow-sm shadow-gray-400/50"
            onClick={() => router.push("/distributor/order-bahan-baku")}
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Kembali
          </Button>
        </div>
        <p>
          Entry bahan baku, pastikan data yang sudah diinputkan telah
          benar. Form inputan tidak dapat diedit dan dihapus setelah order
          dibuat. Alternatifnya silahkan hubungi owner untuk mengubah
          data.
        </p>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <label>Nama Pabrik:</label>
            <Input
              type="text"
              value={factory}
              onChange={(e) => setFactory(e.target.value)}
              placeholder="Masukkan nama pabrik"
              required
              aria-invalid={!factory}
            />
          </div>
          <div className="grid gap-2">
            <label>Deskripsi:</label>
            <Textarea
              placeholder="Masukkan deskripsi order bahan baku"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              aria-invalid={!description}
            />
          </div>

          <div className="grid grid-cols-5 gap-4 items-end">
            <div className="grid gap-2">
              <label>Bahan Baku</label>
              <Select
                value={currentMaterial}
                onValueChange={setCurrentMaterial}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Bahan Baku">
                    {materials.find((m) => m.id == currentMaterial)?.name}
                    {materials.find((m) => m.id == currentMaterial)
                      ? " / "
                      : ""}
                    {
                      materials.find((m) => m.id == currentMaterial)?.unit
                        ?.name
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {materials?.map((material) => (
                    <SelectItem key={material.id} value={material.id.toString()}>
                      {material?.name} / {material?.unit?.name}
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
                  const formattedValue = formatWithComma(e.target.value);
                  setCurrentAmount(formattedValue);
                  setTotalPrice(
                    calculateTotal(formattedValue, price).toString()
                  );
                }}
                placeholder="Jumlah"
              />
            </div>
            <div className="grid gap-2">
              <label>Harga</label>
              <Input
                type="text"
                value={price}
                onChange={(e) => {
                  const formattedValue = formatWithComma(e.target.value);
                  setPrice(formattedValue);
                  setTotalPrice(
                    calculateTotal(currentAmount, formattedValue).toString()
                  );
                }}
                placeholder="Rp. 0"
              />
            </div>
            <div className="grid gap-2">
              <label>Sub Total</label>
              <Input
                type="text"
                value={"Rp. " + formatNumberWithComma(subTotal)}
                placeholder="Rp. 0"
                disabled
              />
            </div>
            <Button type="button" onClick={addDetail} variant="outline">
              <ShoppingCart className="w-4 h-4 mr-1" />
              Tambah
            </Button>
          </div>
          <h1 className="text-lg font-semibold">Detail Order</h1>
          <div className="border rounded-lg">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Bahan Baku</th>
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
                          (m) => m.id == detail.material_distributor_id
                        )?.name
                      }{" "}
                      /
                      {
                        materials.find(
                          (m) => m.id == detail.material_distributor_id
                        )?.unit?.name
                      }
                    </td>
                    <td className="px-4 py-2">
                      {new Intl.NumberFormat("id-ID", {
                        style: "decimal",
                        currency: "IDR",
                      }).format(detail.amount)}
                    </td>
                    <td className="px-4 py-2">
                      Rp.{" "}
                      {new Intl.NumberFormat("id-ID", {
                        style: "decimal",
                        currency: "IDR",
                      }).format(detail.price)}
                    </td>
                    <td className="px-4 py-2">
                      Rp.{" "}
                      {new Intl.NumberFormat("id-ID", {
                        style: "decimal",
                        currency: "IDR",
                      }).format(detail.sub_total)}
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
                    <td colSpan={5} className="h-24 text-center py-1">
                      <EmptyData text="Keranjang kosong" />
                    </td>
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

      </div>
    </MainPage>
  );
}
