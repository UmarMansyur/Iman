/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useUserStore } from "@/store/user-store";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ProductionReportForm from "./components/ProductionReportForm";
import type { Product } from "./types";

export default function EditProductionReport({ fetchData, initialData }: { fetchData: () => Promise<void>; initialData: any }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState(initialData.product_id || "");
  const [isMorningShift, setIsMorningShift] = useState(initialData.isMorningShift || true);
  const [shiftAmount, setShiftAmount] = useState(initialData.morning_shift_amount || initialData.afternoon_shift_amount || "");
  const [selectedHour, setSelectedHour] = useState(initialData.morning_shift_time || initialData.afternoon_shift_time || "");
  const [selectedMinute, setSelectedMinute] = useState(initialData.morning_shift_time || initialData.afternoon_shift_time || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const { user } = useUserStore();

  const formatNumber = (value: string) => {
    const number = value.replace(/\D/g, "");
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const factory_id = user?.factory_selected?.id || "";
        const response = await fetch(`/api/product?factory_id=${factory_id}`);
        const data = await response.json();
        setProducts(data.products);
      } catch (error: any) {
        toast.error(error.message);
      }
    };
    fetchProducts();
  }, [user]);

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
        morning_shift_user_id: isMorningShift ? user.id : null,
        afternoon_shift_user_id: !isMorningShift ? user.id : null,
      };
  
      const response = await fetch(`/api/laporan-produksi/${initialData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
  
      const data = await response.json();
  
      if (!response.ok) throw new Error(data.message);
  
      toast.success("Laporan berhasil diperbarui");
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
        <Button className="w-full flex justify-start px-2 bg-transparent hover:bg-transparent text-neutral-800">
          <Pencil className="w-4 h-4 mr-2" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogTitle>Edit Laporan Produksi</DialogTitle>
        <DialogDescription>
          Perbarui laporan produksi yang ada
        </DialogDescription>
        <ProductionReportForm
          products={products}
          selectedProduct={selectedProduct}
          setSelectedProduct={setSelectedProduct}
          isMorningShift={isMorningShift}
          setIsMorningShift={setIsMorningShift}
          shiftAmount={shiftAmount}
          setShiftAmount={setShiftAmount}
          selectedHour={selectedHour}
          setSelectedHour={setSelectedHour}
          selectedMinute={selectedMinute}
          setSelectedMinute={setSelectedMinute}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          formatNumber={formatNumber}
        />
      </DialogContent>
    </Dialog>
  );
}