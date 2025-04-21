/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useUserStore } from "@/store/user-store";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Product {
  id: string;
  name: string;
  type: string;
}

interface ProductionInput {
  amount: string;
  unit: string;
}

export default function CreateProductionReport({ fetchData, products }: { fetchData: () => Promise<void>, products: Product[] }) {
  const [selectedProduct, setSelectedProduct] = useState("");
  const [isMorningShift, setIsMorningShift] = useState(true);
  const [selectedHour, setSelectedHour] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productionInputs, setProductionInputs] = useState<ProductionInput[]>([
    { amount: "", unit: "" }
  ]);

  const router = useRouter();
  const { user } = useUserStore();

  const formatNumber = (value: string) => {
    const number = value.replace(/\D/g, "");
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  useEffect(() => {
    if (isMorningShift) {
      if (parseInt(selectedHour) > 13) {
        setSelectedHour("");
      }
    } else {
      if (parseInt(selectedHour) <= 13) {
        setSelectedHour("");
      }
    }
  }, [isMorningShift, selectedHour]);

  const addProductionInput = () => {
    setProductionInputs([...productionInputs, { amount: "", unit: "" }]);
  };

  const removeProductionInput = (index: number) => {
    const newInputs = productionInputs.filter((_, i) => i !== index);
    setProductionInputs(newInputs);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    try {
      if (!user?.factory_selected?.id) {
        throw new Error("Pilih pabrik terlebih dahulu");
      }

      let totalPacks = 0;
      for (const input of productionInputs) {
        const inputAmount = parseFloat(input.amount.replace(/,/g, ""));
        if (input.unit === "Bal") {
          totalPacks += inputAmount * 20 * 10;
        } else if (input.unit === "Karton") {
          totalPacks += inputAmount * 80;
        } else if (input.unit === "Slop") {
          totalPacks += inputAmount * 10;
        } else {
          totalPacks += inputAmount;
        }
      }

      const payload = {
        product_id: parseInt(selectedProduct),
        factory_id: user.factory_selected.id,
        morning_shift_amount: isMorningShift ? totalPacks : null,
        morning_shift_time: isMorningShift ? "12:00:00" : null,
        afternoon_shift_amount: !isMorningShift ? totalPacks : null,
        afternoon_shift_time: !isMorningShift ? "16:00:00" : null,
        type: "In",
        morning_shift_user_id: isMorningShift ? user.id : null,
        afternoon_shift_user_id: !isMorningShift ? user.id : null,
      };
  
      const response = await fetch("/api/laporan-produksi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
  
      const data = await response.json();
  
      if (!response.ok) throw new Error(data.message);
  
      toast.success("Laporan berhasil dibuat");
      router.refresh();
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-1" />
          Tambah Produksi Harian
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogTitle>Tambah Produksi Harian</DialogTitle>
        <DialogDescription>
          Buat laporan produksi baru
        </DialogDescription>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Produk</Label>
            <Select
              value={selectedProduct}
              onValueChange={setSelectedProduct}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih Produk">
                  {products.find(product => product.id == selectedProduct)?.name + " - " + products.find(product => product.id == selectedProduct)?.type}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name} - {product.type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-4">
            <Label>Shift</Label>
            <div className="flex items-center space-x-2">
              <Switch
                checked={isMorningShift}
                onCheckedChange={setIsMorningShift}
              />
              <Label>{isMorningShift ? "Pagi" : "Siang"}</Label>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Jumlah Produksi</Label>
              <Button type="button" variant="outline" size="sm" onClick={addProductionInput}>
                <Plus className="w-4 h-4 mr-1" />
                Tambah Input
              </Button>
            </div>
            
            {productionInputs.map((input, index) => (
              <div key={index} className="flex gap-2">
                <div className="flex-1">
                  <Input
                    type="text"
                    value={input.amount}
                    onChange={(e) => {
                      const value = e.target.value.replace(/,/g, "");
                      if (/^\d*$/.test(value) || value === "") {
                        const newInputs = [...productionInputs];
                        newInputs[index].amount = formatNumber(value);
                        setProductionInputs(newInputs);
                      }
                    }}
                    placeholder="Jumlah"
                    required
                  />
                </div>
                <Select
                  value={input.unit}
                  onValueChange={(value) => {
                    const newInputs = [...productionInputs];
                    newInputs[index].unit = value;
                    setProductionInputs(newInputs);
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Pilih Satuan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pack">Pack</SelectItem>
                    <SelectItem value="Bal">Bal (20 Press)</SelectItem>
                    <SelectItem value="Karton">Karton</SelectItem>
                    <SelectItem value="Slop">Slop</SelectItem>
                  </SelectContent>
                </Select>
                {productionInputs.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => removeProductionInput(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Menyimpan..." : "Simpan Laporan"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}