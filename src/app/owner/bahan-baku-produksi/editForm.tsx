/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
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
import { Plus, Trash2, RotateCcw, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useUserStore } from "@/store/user-store";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { DialogTitle } from "@/components/ui/dialog";

interface Material {
  id: string;
  material: string;
  unit: string;
}

interface DetailMaterial {
  material_unit_id: string;
  amount: number;
}

interface EditMaterialStockReportProps {
  data: {
    id: number;
    desc: string;
    total_amount: number;
    detail: Array<{
      material_unit: string;
      unit: string;
      amount: number;
    }>;
    DetailReportMaterialStock: Array<{
      material_unit_id: number;
      amount: number;
    }>;
  };
  fetchData: () => Promise<void>;
}

export default function EditMaterialStockReport({
  data,
  fetchData,
}: EditMaterialStockReportProps) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [details, setDetails] = useState<DetailMaterial[]>(
    data.DetailReportMaterialStock.map((item) => ({
      material_unit_id: item.material_unit_id.toString(),
      amount: item.amount,
    }))
  );
  const [description, setDescription] = useState(data.desc);
  const [currentMaterial, setCurrentMaterial] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const { user } = useUserStore();

  const formatNumber = (value: string) => {
    const number = value.replace(/\D/g, "");
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const factory_id = user?.factory_selected?.id || "";
        const response = await fetch(`/api/material-unit?limit=1000&page=1&factory_id=${factory_id}`);
        const data = await response.json();
        setMaterials(data.data);
      } catch (error: any) {
        toast.error(error.message);
      }
    };
    fetchMaterials();
  }, []);

  const addDetail = () => {
    if (!currentMaterial) {
      toast.error("Pilih material terlebih dahulu");
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
      // update amount
      const updatedDetails = details.map((detail) =>
        detail.material_unit_id === currentMaterial
          ? {
              ...detail,
              amount: Number(currentAmount.replace(/,/g, "")) + detail.amount,
            }
          : detail
      );
      setDetails(updatedDetails);
    } else {
      setDetails([
        ...details,
        {
          material_unit_id: currentMaterial,
          amount: Number(currentAmount.replace(/,/g, "")),
        },
      ]);
    }

    setCurrentMaterial("");
    setCurrentAmount("");
  };

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
        user_id: user?.id,
        factory_id: user?.factory_selected?.id,
        details: details.map((detail) => ({
          material_unit_id: detail.material_unit_id,
          amount: detail.amount,
        })),
        total_amount: details.reduce((acc, curr) => acc + curr.amount, 0),
      };

      const response = await fetch(
        `/api/material-stock/production/${data.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const responseData = await response.json();

      if (!response.ok) throw new Error(responseData.message);

      toast.success("Laporan berhasil diperbarui");
      router.push("/owner/bahan-baku-produksi");
      fetchData();
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

  const renderMaterialSelectValue = (materialId: string) => {
    const material = materials.find((m) => m.id == materialId);
    if (!material) return "";
    return `${material.material} / ${material.unit}`;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start border-none">
          <Pencil className="w-4 h-4 mr-1" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogTitle>Edit Laporan Bahan Baku Produksi</DialogTitle>
        <DialogDescription>
          Silakan edit data laporan bahan baku produksi di bawah ini
        </DialogDescription>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <label>Deskripsi</label>
            <Textarea
              placeholder="Masukkan deskripsi laporan"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4 items-end">
            <div className="grid gap-2">
              <label>Material</label>
              <Select
                value={currentMaterial}
                onValueChange={setCurrentMaterial}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Material">
                    {renderMaterialSelectValue(currentMaterial)}
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
                  <th className="px-4 py-2 text-left">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {details.map((detail, index) => (
                  <tr key={index} className="border-t">
                    <td className="px-4 py-2">
                      {
                        materials.find((m) => m.id == detail.material_unit_id)
                          ?.material
                      }{" "}
                      /
                      {
                        materials.find((m) => m.id == detail.material_unit_id)
                          ?.unit
                      }
                    </td>
                    <td className="px-4 py-2">
                      {formatNumber(detail.amount.toString())}
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
                    <td colSpan={3} className="text-center py-10">
                      Tidak ada data
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
              {isSubmitting ? "Menyimpan..." : "Perbarui Laporan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
