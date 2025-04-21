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
// Generate minutes (00-59)
const minutes = Array.from({ length: 60 }, (_, i) => 
  i.toString().padStart(2, '0')
);

// Update the hours generation with shift-specific ranges
const morningHours = Array.from({ length: 13 }, (_, i) => 
  (i + 1).toString().padStart(2, '0')
);

const afternoonHours = Array.from({ length: 11 }, (_, i) => 
  (i + 14).toString().padStart(2, '0')
);

export default function CreateProductionReport({ fetchData, products }: { fetchData: () => Promise<void>, products: Product[] }) {
  const [selectedProduct, setSelectedProduct] = useState("");
  const [isMorningShift, setIsMorningShift] = useState(true);
  const [shiftAmount, setShiftAmount] = useState("");
  const [selectedHour, setSelectedHour] = useState("");
  const [selectedMinute, setSelectedMinute] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const { user } = useUserStore();

  const formatNumber = (value: string) => {
    const number = value.replace(/\D/g, "");
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const availableHours = isMorningShift ? morningHours : afternoonHours;

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
  
      const shiftTime = selectedHour && selectedMinute ? `${selectedHour}:${selectedMinute}` : null;
  
      const payload = {
        product_id: parseInt(selectedProduct),
        factory_id: user.factory_selected.id,
        morning_shift_amount: isMorningShift ? parseFloat(shiftAmount.replace(/,/g, "")) : null,
        morning_shift_time: isMorningShift ? shiftTime : null,
        afternoon_shift_amount: !isMorningShift ? parseFloat(shiftAmount.replace(/,/g, "")) : null,
        afternoon_shift_time: !isMorningShift ? shiftTime : null,
        type: "In",
        morning_shift_user_id: isMorningShift ? user.id : null, // Morning shift ID
        afternoon_shift_user_id: !isMorningShift ? user.id : null, // Afternoon shift ID
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Jam</Label>
              <Select
                value={selectedHour}
                onValueChange={setSelectedHour}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jam" />
                </SelectTrigger>
                <SelectContent>
                  {availableHours.map((hour) => (
                    <SelectItem key={hour} value={hour}>
                      {hour}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Menit</Label>
              <Select
                value={selectedMinute}
                onValueChange={setSelectedMinute}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih menit" />
                </SelectTrigger>
                <SelectContent>
                  {minutes.map((minute) => (
                    <SelectItem key={minute} value={minute}>
                      {minute}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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