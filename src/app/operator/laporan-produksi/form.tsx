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
import { Plus } from "lucide-react";
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


export default function CreateProductionReport({ fetchData, products }: { fetchData: () => Promise<void>, products: Product[] }) {
  const [selectedProduct, setSelectedProduct] = useState("");
  const [isMorningShift, setIsMorningShift] = useState(true);
  const [shiftAmount, setShiftAmount] = useState("");
  const [selectedHour, setSelectedHour] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState("");

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    try {
      if (!user?.factory_selected?.id) {
        throw new Error("Pilih pabrik terlebih dahulu");
      }
      let amount = 0;
      if (selectedUnit === "Bal") {
        amount = parseFloat(shiftAmount.replace(/,/g, "")) * 200;
      } else if (selectedUnit === "Pack") {
        amount = parseFloat(shiftAmount.replace(/,/g, "")) * 10;
      } else if (selectedUnit === "Karton") {
        amount = parseFloat(shiftAmount.replace(/,/g, "")) * 800;
      } else if (selectedUnit === "Slop") {
        amount = parseFloat(shiftAmount.replace(/,/g, "")) * 10;
      } else {
        amount = parseFloat(shiftAmount.replace(/,/g, ""));
      }
  
      const payload = {
        product_id: parseInt(selectedProduct),
        factory_id: user.factory_selected.id,
        morning_shift_amount: isMorningShift ? amount : null,
        morning_shift_time: isMorningShift ? "12:00:00" : null,
        afternoon_shift_amount: !isMorningShift ? amount : null,
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
          <div className="space-y-2">
            <Label>Pilih Jenis Satuan</Label>
            <Select
              value={selectedUnit}
              onValueChange={setSelectedUnit}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih Satuan">
                  {selectedUnit}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pack">Pack</SelectItem>
                <SelectItem value="Bal">Bal</SelectItem>
                <SelectItem value="Karton">Karton</SelectItem>
                <SelectItem value="Slop">Slop</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Jumlah Produksi</Label>
            <Input
              type="text"
              value={shiftAmount}
              onChange={(e) => {
                const value = e.target.value.replace(/,/g, "");
                if (/^\d*$/.test(value) || value === "") {
                  setShiftAmount(formatNumber(value));
                }
              }}
              placeholder={`Jumlah produksi shift ${isMorningShift ? 'pagi' : 'siang'}`}
              required
            />
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