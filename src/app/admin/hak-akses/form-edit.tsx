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
import {useState } from "react";

import { RoleFormState } from "@/lib/definitions";
import { Pencil } from "lucide-react";
import { DialogClose } from "@radix-ui/react-dialog";

import toast from "react-hot-toast";
import createRole from "@/app/actions/role";

export default function Form({ role, fetchData }: { 
  role?: { id: number; role: string },
  fetchData: () => Promise<void>,
}) {
  const [state, setState] = useState<RoleFormState>();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append('id', role?.id?.toString() || '');
    
    const response = await createRole(undefined, formData);
    if (response?.errors) {
      setState(response.errors as RoleFormState);
      toast.error(response?.errors.name?.join(", ") || "Gagal memperbarui hak akses");
    } else {
      toast.success("Hak akses berhasil diperbarui");
    }
    await fetchData();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full flex justify-start px-2">
          <Pencil className="w-4 h-4 mr-1" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Hak Akses</DialogTitle>
          <DialogDescription>
            Masukkan nama baru untuk mengubah hak akses. Klik tombol simpan untuk
            menyimpan perubahan.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name">Nama</Label>
              <Input
                id="name"
                name="name"
                defaultValue={role?.role}
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
