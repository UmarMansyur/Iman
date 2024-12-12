/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(dashboard)/laporan-produksi/components/ActionCell.tsx
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(row.original.product_id);

  // Form states
  const [morningAmount, setMorningAmount] = useState(row.original.morning_shift_amount?.toString() || "");
  const [morningTime, setMorningTime] = useState(
    row.original.morning_shift_time ? 
    new Date(row.original.morning_shift_time).toTimeString().slice(0,5) : 
    ""
  );
  const [afternoonAmount, setAfternoonAmount] = useState(row.original.afternoon_shift_amount?.toString() || "");
  const [afternoonTime, setAfternoonTime] = useState(
    row.original.afternoon_shift_time ? 
    new Date(row.original.afternoon_shift_time).toTimeString().slice(0,5) : 
    ""
  );

  const formatNumber = (value: string) => {
    const number = value.replace(/\D/g, "");
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload: any = {
        morning_shift_amount: morningAmount ? parseFloat(morningAmount.replace(/,/g, "")) : null,
        morning_shift_time: morningTime || null,
        afternoon_shift_amount: afternoonAmount ? parseFloat(afternoonAmount.replace(/,/g, "")) : null,
        afternoon_shift_time: afternoonTime || null,
      };

      // check apakah morning_shift_user_id atau afternoon_shift_user_id ada
      if(!payload.morning_shift_user_id) {
        payload.morning_shift_user_id = Number(user!.id);
      } 
      if(!payload.afternoon_shift_user_id) {
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

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/laporan-produksi/${row.original.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      toast.success("Laporan berhasil dihapus");
      setIsDeleteOpen(false);
      router.refresh();
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
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
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsDeleteOpen(true)} className="text-red-600">
              <Trash className="mr-2 h-4 w-4" />
              Hapus
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
                  placeholder="Jumlah produksi shift siang"
                />
                <Input
                  type="time"
                  value={afternoonTime}
                  onChange={(e) => setAfternoonTime(e.target.value)}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Laporan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus laporan ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}