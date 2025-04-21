/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(dashboard)/laporan-produksi/components/ActionCell.tsx
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
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

interface UnitInput {
  amount: string;
  unit: string;
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
  const [morningInputs, setMorningInputs] = useState<UnitInput[]>([
    {
      amount: row.original.morning_shift_amount?.toString() || "",
      unit: "Pack",
    },
  ]);
  const [afternoonInputs, setAfternoonInputs] = useState<UnitInput[]>([
    {
      amount: row.original.afternoon_shift_amount?.toString() || "",
      unit: "Pack",
    },
  ]);

  const convertToPacks = (amount: number, unit: string) => {
    const conversions: Record<string, number> = {
      Pack: 1,
      Bal: 200,
      Karton: 800,
      Slop: 10,
      Press: 20,
    };
    return amount * (conversions[unit] || 1);
  };

  const calculateTotalPacks = (inputs: UnitInput[]) => {
    return inputs.reduce((total, input) => {
      const amount = parseFloat(input.amount.replace(/,/g, "")) || 0;
      return total + convertToPacks(amount, input.unit);
    }, 0);
  };

  const handleSelectUnit = (value: string) => {
    const morning = convertToPacks(
      parseFloat(`${morningInputs[0].amount}`.replace(/,/g, "")),
      value
    );
    const afternoon = convertToPacks(
      parseFloat(`${afternoonInputs[0].amount}`.replace(/,/g, "")),
      value
    );
    setMorningInputs([{ amount: morning.toString(), unit: value }]);
    setAfternoonInputs([{ amount: afternoon.toString(), unit: value }]);
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
        morning_shift_amount: calculateTotalPacks(morningInputs),
        morning_shift_time: "12:00:00",
        afternoon_shift_amount: calculateTotalPacks(afternoonInputs),
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
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              Update Laporan
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DialogContent className="max-w-2xl">
          <DialogTitle>Edit Laporan Produksi</DialogTitle>
          <DialogDescription>
            Secara default, laporan produksi akan dikonversi ke jumlah{" "}
            <b className="text-blue-500 font-bold">Pack</b>. Tapi jangan
            khawatir, jika anda ingin mengubah jumlah produksi dengan satuan
            yang lain, anda dapat mengubah satuan produksi dibawah ini.
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
                  <SelectItem value="Press">Press</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <Label>Shift Pagi</Label>
              {morningInputs.map((input, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    type="text"
                    value={input.amount}
                    onChange={(e) => {
                      const value = e.target.value.replace(/,/g, "");
                      if (/^\d*$/.test(value) || value === "") {
                        const newInputs = [...morningInputs];
                        newInputs[index].amount = formatNumber(value);
                        setMorningInputs(newInputs);
                      }
                    }}
                    disabled={row.original.morning_shift_user?.id != user?.id}
                    placeholder="Jumlah produksi"
                    className="flex-1"
                  />
                  <Select
                    disabled={row.original.morning_shift_user?.id != user?.id}
                    value={input.unit}
                    onValueChange={(value) => {
                      const newInputs = [...morningInputs];
                      newInputs[index].unit = value;
                      setMorningInputs(newInputs);
                    }}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pack">Pack</SelectItem>
                      <SelectItem value="Bal">Bal</SelectItem>
                      <SelectItem value="Karton">Karton</SelectItem>
                      <SelectItem value="Slop">Slop</SelectItem>
                      <SelectItem value="Press">Press</SelectItem>
                    </SelectContent>
                  </Select>
                  {morningInputs.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => {
                        setMorningInputs(
                          morningInputs.filter((_, i) => i !== index)
                        );
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setMorningInputs([
                    ...morningInputs,
                    { amount: "", unit: "Pack" },
                  ])
                }
                disabled={row.original.morning_shift_user?.id != user?.id}
              >
                <Plus className="h-4 w-4 mr-2" /> Tambah Input
              </Button>
            </div>

            <div className="space-y-4">
              <Label>Shift Siang</Label>
              {afternoonInputs.map((input, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    type="text"
                    value={input.amount}
                    onChange={(e) => {
                      const value = e.target.value.replace(/,/g, "");
                      if (/^\d*$/.test(value) || value === "") {
                        const newInputs = [...afternoonInputs];
                        newInputs[index].amount = formatNumber(value);
                        setAfternoonInputs(newInputs);
                      }
                    }}
                    placeholder="Jumlah produksi"
                    className="flex-1"
                  />
                  <Select
                    value={input.unit}
                    onValueChange={(value) => {
                      const newInputs = [...afternoonInputs];
                      newInputs[index].unit = value;
                      setAfternoonInputs(newInputs);
                    }}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pack">Pack</SelectItem>
                      <SelectItem value="Bal">Bal</SelectItem>
                      <SelectItem value="Karton">Karton</SelectItem>
                      <SelectItem value="Slop">Slop</SelectItem>
                      <SelectItem value="Press">Press</SelectItem>
                    </SelectContent>
                  </Select>
                  {afternoonInputs.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => {
                        setAfternoonInputs(
                          afternoonInputs.filter((_, i) => i !== index)
                        );
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setAfternoonInputs([
                    ...afternoonInputs,
                    { amount: "", unit: "Pack" },
                  ])
                }
              >
                <Plus className="h-4 w-4 mr-2" /> Tambah Input
              </Button>
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
