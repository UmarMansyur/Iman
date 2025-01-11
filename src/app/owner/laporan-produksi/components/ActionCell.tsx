/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(dashboard)/laporan-produksi/components/ActionCell.tsx
import { MoreHorizontal, Pencil } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUserStore } from "@/store/user-store";

interface ActionCellProps {
  row: any;
  fetchData: () => Promise<void>;
  products: any[];
}

export function ActionCell({ row, fetchData, products }: ActionCellProps) {
  const router = useRouter();
  const { user } = useUserStore();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(
    row.original.product_id
  );

  // Form states
  const [morningAmount, setMorningAmount] = useState(
    row.original.morning_shift_amount?.toString() || ""
  );
  const [afternoonAmount, setAfternoonAmount] = useState(
    row.original.afternoon_shift_amount?.toString() || ""
  );

  // Tambahkan array untuk opsi jam dan menit
  const hours = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, "0")
  );
  const minutes = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, "0")
  );

  // Pisahkan waktu menjadi jam dan menit
  const [morningHour, setMorningHour] = useState(
    row.original.morning_shift_time
      ? new Date(row.original.morning_shift_time)
          .getHours()
          .toString()
          .padStart(2, "0")
      : ""
  );
  const [morningMinute, setMorningMinute] = useState(
    row.original.morning_shift_time
      ? new Date(row.original.morning_shift_time)
          .getMinutes()
          .toString()
          .padStart(2, "0")
      : ""
  );
  const [afternoonHour, setAfternoonHour] = useState(
    row.original.afternoon_shift_time
      ? new Date(row.original.afternoon_shift_time)
          .getHours()
          .toString()
          .padStart(2, "0")
      : ""
  );
  const [afternoonMinute, setAfternoonMinute] = useState(
    row.original.afternoon_shift_time
      ? new Date(row.original.afternoon_shift_time)
          .getMinutes()
          .toString()
          .padStart(2, "0")
      : ""
  );

  const formatNumber = (value: string) => {
    const number = value.replace(/\D/g, "");
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const morningTime =
        morningHour && morningMinute ? `${morningHour}:${morningMinute}` : null;
      const afternoonTime =
        afternoonHour && afternoonMinute
          ? `${afternoonHour}:${afternoonMinute}`
          : null;

      const payload: any = {
        morning_shift_amount: morningAmount
          ? parseFloat(morningAmount.replace(/,/g, ""))
          : null,
        morning_shift_time: morningTime,
        afternoon_shift_amount: afternoonAmount
          ? parseFloat(afternoonAmount.replace(/,/g, ""))
          : null,
        afternoon_shift_time: afternoonTime,
      };

      // check apakah morning_shift_user_id atau afternoon_shift_user_id ada
      if (!payload.morning_shift_user_id) {
        payload.morning_shift_user_id = Number(user!.id);
      }
      if (!payload.afternoon_shift_user_id) {
        payload.afternoon_shift_user_id = Number(user!.id);
      }

      const response = await fetch(`/api/laporan-produksi/${row.original.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      toast.success("Laporan berhasil diperbarui");
      setIsEditOpen(false);
      router.refresh();
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <>
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              Update Laporan
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DialogContent>
          <DialogTitle>Edit Laporan Produksi</DialogTitle>
          <DialogDescription>
            Perbarui informasi laporan produksi
          </DialogDescription>

          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <Label>Produk</Label>
              <Select
                value={selectedProduct}
                onValueChange={setSelectedProduct}
              >
                <SelectTrigger disabled>
                  <SelectValue placeholder="Pilih Produk">
                    {products.find((product) => product.id == selectedProduct)
                      ?.name +
                      " - " +
                      products.find((product) => product.id == selectedProduct)
                        ?.type}
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
                  placeholder="Jumlah produksi shift pagi"
                />
                <div className="space-y-1">
                  <Label className="text-sm text-gray-500">
                    Waktu Shift Pagi
                  </Label>
                  <div className="flex gap-2 w-full">
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-400">Jam</Label>
                      <Select
                        value={morningHour}
                        onValueChange={setMorningHour}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Jam" />
                        </SelectTrigger>
                        <SelectContent>
                          {hours.map((hour) => (
                            <SelectItem key={hour} value={hour}>
                              {hour}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-400">Menit</Label>
                      <Select
                        value={morningMinute}
                        onValueChange={setMorningMinute}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Menit" />
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
                </div>
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
                  placeholder="Jumlah produksi shift siang"
                />
                <div className="space-y-1">
                  <Label className="text-sm text-gray-500">
                    Waktu Shift Siang
                  </Label>
                  <div className="flex gap-2 w-full">
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-400">Jam</Label>
                      <Select
                        value={afternoonHour}
                        onValueChange={setAfternoonHour}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Jam" />
                        </SelectTrigger>
                        <SelectContent>
                          {hours.map((hour) => (
                            <SelectItem key={hour} value={hour}>
                              {hour}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-400">Menit</Label>
                      <Select
                        value={afternoonMinute}
                        onValueChange={setAfternoonMinute}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Menit" />
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
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
