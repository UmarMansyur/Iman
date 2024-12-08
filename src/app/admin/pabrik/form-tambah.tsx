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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { createFactory } from "@/app/actions/factory";
import toast from "react-hot-toast";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Form({ fetchData, users }: { fetchData: () => Promise<void>, users: { value: string; label: string }[] }) {
  const [state, setState] = useState<FactoryFormState>();
  const [selectedUser, setSelectedUser] = useState<{ value: string; label: string }>();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append("user_id", selectedUser?.value || "");
    
    const response = await createFactory(undefined, formData);
    if (response?.errors) {
      setState(response.errors as FactoryFormState);
    } else {
      toast.success(response?.message || "Pabrik berhasil ditambahkan");
      setOpen(false);
    }
    await fetchData();
  };

  const [open, setOpen] = useState(false);
  

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
          <DialogTitle>Tambah Pabrik</DialogTitle>
          <DialogDescription>
            Masukkan data untuk menambah pabrik baru. Klik tombol simpan untuk
            menyimpan data.
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
              />
              {state?.errors?.name && <p className="text-red-500 col-span-3 col-start-2">{state.errors.name.join(", ")}</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nickname">Nama Singkat</Label>
              <Input
                id="nickname"
                className="col-span-3"
                name="nickname"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="creator">Pembuat</Label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild className="col-span-3" name="user_id">
                  <Button
                    variant="ghost"
                    role="combobox"
                    className="justify-between col-span-3 bg-white border border-gray-300 text-black"
                  >
                    {selectedUser?.label || "Pilih Pembuat..."}
                   <ChevronsUpDown className="opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 justify-between">
                  <Command>
                    <CommandInput placeholder="Search framework..." />
                    <CommandList>
                      <CommandEmpty>
                        Tidak ada pembuat ditemukan.
                      </CommandEmpty>
                      <CommandGroup>
                        {users.map((user) => (
                          <CommandItem
                            key={user.value}
                            value={user.value}
                            onSelect={() => {
                              setSelectedUser(user);
                              setOpen(false);
                            }}
                          >
                            {user.label}
                            <Check
                              className={cn(
                                "ml-auto",
                                selectedUser?.value === user.value ? "opacity-100" : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status">Status</Label>
              <Select name="status">
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Pilih Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Aktif</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Inactive">Tidak Aktif</SelectItem>
                  <SelectItem value="Suspended">Ditangguhkan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="logo">Logo</Label>
              <Input
                id="logo"
                type="file"
                name="logo"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address">Alamat</Label>
              <Textarea
                id="address"
                name="address"
                className="col-span-3"
              />
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
