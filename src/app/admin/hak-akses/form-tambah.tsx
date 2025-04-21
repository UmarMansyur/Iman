import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { RoleFormState } from "@/lib/definitions";
import { Plus } from "lucide-react";
import { DialogClose } from "@radix-ui/react-dialog";
import toast from "react-hot-toast";
import createRole from "@/app/actions/role";

export default function Form({ fetchData }: { fetchData: () => Promise<void> }) {
  const [state, setState] = useState<RoleFormState>();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append('id', '');
    const response = await createRole(undefined, formData);
    if (response?.errors) {
      setState(response.errors as RoleFormState);
      toast.error(response?.errors.name?.join(", ") || "Gagal menambahkan hak akses");
    } else {
      toast.success("Hak akses berhasil ditambahkan");
    }
    await fetchData();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="bg-blue-500 hover:bg-blue-600 text-white hover:text-white">
          <Plus className="w-4 h-4" />
          Tambah
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Hak Akses</DialogTitle>
          <DialogDescription>
            Masukkan nama untuk menambah hak akses baru. Klik tombol simpan untuk
            menyimpan data.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name">Nama</Label>
              <Input
                id="name"
                name="name"
                placeholder="Masukkan hak akses"
                className="col-span-3"
              />
              {state?.errors?.name && (
                <p className="text-red-500 col-span-3 col-start-2">
                  {state.errors.name.join(", ")}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                className="bg-white hover:bg-gray-100 border border-gray-300"
              >
                Batal
              </Button>
            </DialogClose>
            <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
              Simpan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
