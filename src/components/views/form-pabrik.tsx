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

import { FactoryFormState } from "@/lib/definitions";
import { Plus } from "lucide-react";
import { DialogClose } from "@radix-ui/react-dialog";
import { createFactory } from "@/app/actions/factory";
import toast from "react-hot-toast";
import { Textarea } from "@/components/ui/textarea";
import { useUserStore } from "@/store/user-store";

export default function FormPabrik() {
  const [state, setState] = useState<FactoryFormState>();
  const { user } = useUserStore();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    formData.append("user_id", user?.id || "");
    formData.append("status", "Pending");

    const response = await createFactory(undefined, formData);
    if (response?.errors) {
      setState(response.errors as FactoryFormState);
      toast.error(response?.errors?.name?.join(", ") || response?.errors?.nickname?.join(", ") || response?.errors?.address?.join(", ") || response?.errors?.logo?.join(", ") || response?.errors?.status?.join(", ") || "Terjadi kesalahan");
    } else {
      toast.success(response?.message || "Pabrik berhasil ditambahkan");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button type="button" className="flex items-center gap-2">
          <div className="flex size-6 items-center justify-center rounded-md border bg-background">
            <Plus className="size-4" />
          </div>
          <span className="text-sm">Tambah</span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader className="border-b py-4">
          <DialogTitle>Tambah Pabrik</DialogTitle>
          <DialogDescription>
            Data pabrik yang baru statusnya pending, silahkan tunggu konfirmasi dari administrator. Anda dapat membuat pabrik baru dengan maksimal 2 pabrik.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name">Nama</Label>
              <Input
                id="name"
                className="col-span-3"
                name="name"
                placeholder="Nama Pabrik"
                pattern=".*"
              />
              {state?.errors?.name && (
                <p className="text-red-500 col-span-3 col-start-2">
                  {state.errors.name.join(", ")}
                </p>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nickname">Nama Singkat</Label>
              <Input
                id="nickname"
                className="col-span-3"
                name="nickname"
                placeholder="Nama Singkat Pabrik"
                pattern=".*"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="logo">Logo</Label>
              <Input
                id="logo"
                type="file"
                name="logo"
                className="col-span-3"
                placeholder="Logo Pabrik"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address">Alamat</Label>
              <Textarea
                id="address"
                name="address"
                className="col-span-3"
                placeholder="Alamat Pabrik"
              />
            </div>
          </div>
          <DialogFooter className="border-t p-4">
            <DialogClose asChild>
              <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="bg-white hover:bg-gray-100 border border-gray-300"
              >
                Batal
              </Button>
              <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
                Tambah
              </Button>

              </div>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
