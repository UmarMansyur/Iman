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
  const [selectedUnit, setSelectedUnit] = useState("Pack");
  const [selectedProduct, setSelectedProduct] = useState(
    row.original.product_id
  );
  const convertAmount = (amount: number, to: string) => {
    let result = 0;
    if(selectedUnit === "Bal") {
      result = amount * 200;
    } else if(selectedUnit === "Karton") {
      result = amount * 800;
    } else if(selectedUnit === "Slop") {
      result = amount * 10;
    } else if(selectedUnit === "Pack") {
      result = amount;
    }

    if(to === "Pack") {
      return result;
    }

    if(to === "Bal") {
      return result / 200;
    }

    if(to === "Karton") {
      return result / 800;
    }

    if(to === "Slop") {
      return result / 10;
    }

    return result;
  };

  // Form states
  const [morningAmount, setMorningAmount] = useState(
    row.original.morning_shift_amount?.toString() || ""
  );
  const [afternoonAmount, setAfternoonAmount] = useState(
    row.original.afternoon_shift_amount?.toString() || ""
  );

  const handleSelectUnit = (value: string) => {
    const morning = convertAmount(
      parseFloat((`${morningAmount}`).replace(/,/g, "")),
      value
    );
    const afternoon = convertAmount(
      parseFloat((`${afternoonAmount}`).replace(/,/g, "")),
      value
    );
    setMorningAmount(morning);
    setAfternoonAmount(afternoon);
    setSelectedUnit(value);
  };

  const formatNumber = (value: string) => {
    const number = value.replace(/\D/g, "");
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload: any = {
        morning_shift_amount: morningAmount
          ? morningAmount
          : null,
        morning_shift_time: "12:00:00",
        afternoon_shift_amount: afternoonAmount
          ? afternoonAmount
          : null,
        afternoon_shift_time: "16:00:00",
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
        <DropdownMenu>
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

        <DialogContent className="max-w-2xl">
          <DialogTitle>Edit Laporan Produksi</DialogTitle>
          <DialogDescription>
            Secara default, laporan produksi akan dikonversi ke jumlah <b className="text-blue-500 font-bold">Pack</b>.
            Tapi jangan khawatir, jika anda ingin mengubah jumlah produksi
            dengan satuan yang lain, anda dapat mengubah satuan produksi dibawah
            ini.
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
            <div className="space-y-2">
              <Label>Pilih Jenis Satuan</Label>
              <Select value={selectedUnit} onValueChange={handleSelectUnit}>
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
                  disabled={row.original.morning_shift_user?.id != user?.id}
                  placeholder={`Jumlah produksi shift pagi`}
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
                  placeholder="Jumlah produksi shift siang"
                />
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
