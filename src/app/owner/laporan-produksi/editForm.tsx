/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(dashboard)/laporan-produksi/components/EditForm.tsx
"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";


interface EditProductionReportProps {
  data: {
    id: number;
    amount: number;
    morning_shift_amount: number | null;
    morning_shift_time: string | null;
    afternoon_shift_amount: number | null;
    afternoon_shift_time: string | null;
    type: 'In' | 'Out';
    product_id: number;
  };
  fetchData: () => Promise<void>;
}

export default function EditProductionReport({
  data,
  fetchData,
}: EditProductionReportProps) {
  const [amount, setAmount] = useState(data.amount.toString());
  const [morningAmount, setMorningAmount] = useState(data.morning_shift_amount?.toString() || "");
  const [morningTime, setMorningTime] = useState(
    data.morning_shift_time ? 
    new Date(data.morning_shift_time).toTimeString().slice(0,5) : 
    ""
  );
  const [afternoonAmount, setAfternoonAmount] = useState(data.afternoon_shift_amount?.toString() || "");
  const [afternoonTime, setAfternoonTime] = useState(
    data.afternoon_shift_time ? 
    new Date(data.afternoon_shift_time).toTimeString().slice(0,5) : 
    ""
  );
  const [type, setType] = useState(data.type);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();


  const formatNumber = (value: string) => {
    const number = value.replace(/\D/g, "");
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        amount: parseFloat(amount.replace(/,/g, "")),
        morning_shift_amount: morningAmount ? parseFloat(morningAmount.replace(/,/g, "")) : null,
        morning_shift_time: morningTime || null,
        afternoon_shift_amount: afternoonAmount ? parseFloat(afternoonAmount.replace(/,/g, "")) : null,
        afternoon_shift_time: afternoonTime || null,
        type,
      };

      const response = await fetch(
        `/api/reports/production/${data.id}`,
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
        <Button variant="outline" className="w-full justify-start border-none">
          <Pencil className="w-4 h-4 mr-2" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Edit Laporan Produksi</DialogTitle>
        <DialogDescription>
          Silakan edit data laporan produksi di bawah ini
        </DialogDescription>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Total Produksi</Label>
            <Input
              type="text"
              value={amount}
              onChange={(e) => {
                const value = e.target.value.replace(/,/g, "");
                if (/^\d*$/.test(value) || value === "") {
                  setAmount(formatNumber(value));
                }
              }}
              placeholder="Jumlah produksi"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Shift Pagi</Label>
              <Input
                type="text"
                value={morningAmount}
                onChange={(e) => {
                  const value = e.target.value.replace(/,/g, "");
                  if (/^\d*$/.test(value) || value === "") {
                    setMorningAmount(formatNumber(value));
                  }
                }}
                placeholder="Jumlah shift pagi"
              />
              <Input
                type="time"
                value={morningTime}
                onChange={(e) => setMorningTime(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Shift Siang</Label>
              <Input
                type="text"
                value={afternoonAmount}
                onChange={(e) => {
                  const value = e.target.value.replace(/,/g, "");
                  if (/^\d*$/.test(value) || value === "") {
                    setAfternoonAmount(formatNumber(value));
                  }
                }}
                placeholder="Jumlah shift siang"
              />
              <Input
                type="time"
                value={afternoonTime}
                onChange={(e) => setAfternoonTime(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tipe</Label>
            <Select value={type} onValueChange={(value: "In" | "Out") => setType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih tipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="In">Masuk</SelectItem>
                <SelectItem value="Out">Keluar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end pt-4">
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