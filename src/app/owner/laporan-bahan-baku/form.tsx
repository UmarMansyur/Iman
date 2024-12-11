/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Dialog, DialogHeader, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/store/user-store";
import { Material } from "@prisma/client";
import { Check, ChevronsUpDown, PlusCircle } from "lucide-react";
import { useState } from "react";
import { createMaterialStock } from "@/app/actions/material-stock";
import toast from "react-hot-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SelectGroup } from "@radix-ui/react-select";
export default function Form({
  fetchData,
  options,
}: {
  fetchData: () => Promise<void>;
  options: {
    materials: Material[];
  };
}) {
  // formnya ada amount, material_unit_id, status
  // factory_id dan user_id didapatkan dari state useUserStore
  // status ada in dan out karena pelaporan. Tidak ada edit. yang ada tambah dan hapus. hapus menyala jika created_atnya kurang dari 2 hari.
  // out itu jika terpakai.
  const [state, setState] = useState<any>();
  const [materialOpen, setMaterialOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(
    null
  );
  const { user } = useUserStore();

  const createReport = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append("id", selectedMaterial?.id?.toString() || "");
    formData.append("factory_id", user?.factory_selected?.id?.toString() || "");
    
    // Update status values to match enum
    const statusMap = {
      'In': 'Masuk',
      'Out': 'Keluar'
    };
    const status = formData.get("status")?.toString() || "";
    formData.append("status", statusMap[status as keyof typeof statusMap] || "");

    // Combine hours and minutes into time string
    const hours = formData.get("hours")?.toString() || "00";
    const minutes = formData.get("minutes")?.toString() || "00";
    const timeString = `${hours}:${minutes}`;

    if (timeString > "14:00") {
      formData.append("user_afternoon_id", user?.id?.toString() || "");
      formData.append("amount_afternoon", formData.get("amount")?.toString() || "");
      formData.append("afternoon_shift_time", timeString);
    } else {
      formData.append("user_morning_id", user?.id?.toString() || "");
      formData.append("amount_morning", formData.get("amount")?.toString() || "");
      formData.append("morning_shift_time", timeString);
    }
    formData.append("material_unit_id", selectedMaterial?.id?.toString() || "");

    const response = await createMaterialStock(undefined, formData);
    if (response?.errors) {
      setState(response);
      const errorMessages = Object.values(response.errors).flat();
      toast.error(errorMessages.join(", ") || "Terjadi kesalahan");
    } else {
      toast.success("Laporan berhasil dibuat");
      fetchData();
    }
    setState(response);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-blue-500 text-white hover:bg-blue-600 flex justify-start hover:text-white">
          <PlusCircle className="mr-2" /> 
          Lapor Bahan Baku
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-xl">
        <DialogHeader>
          <DialogTitle>Input Laporan</DialogTitle>
          <DialogDescription>
            Masukkan jumlah bahan baku yang terpakai atau tersedia.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={createReport}>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="material">Bahan Baku</Label>
            <Popover open={materialOpen} onOpenChange={setMaterialOpen}>
              <PopoverTrigger asChild className="col-span-3" name="material_id">
                <Button
                  variant="ghost"
                  role="combobox"
                  className="justify-between col-span-3 bg-white border border-gray-300 text-black"
                >
                  {selectedMaterial?.name || "Pilih Bahan Baku..."}
                  <ChevronsUpDown className="opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0 justify-between">
                <Command>
                  <CommandInput placeholder="Search bahan baku..." />
                  <CommandList>
                    <CommandEmpty>
                      Tidak ada bahan baku yang ditemukan.
                    </CommandEmpty>
                    <CommandGroup>
                      <ScrollArea className="h-[200px]">
                        {options.materials.map((material: Material) => (
                          <CommandItem
                            key={material.name}
                            value={material.name}
                            onSelect={() => {
                              setSelectedMaterial(material);
                              setMaterialOpen(false);
                            }}
                          >
                            {material.name}
                            <Check
                              className={cn(
                                "ml-auto",
                                selectedMaterial?.id === material.id
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        ))}
                      </ScrollArea>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {state?.errors?.material_id && (
              <p className="text-red-500 text-sm">
                {state.errors.material_id.join(", ")}
              </p>
            )}
          </div>
          <div className="grid grid-cols-4 items-center gap-4 py-4">
            <Label htmlFor="status">Status</Label>
            <div className="col-span-3">
            <Select name="status">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih status..." />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Status</SelectLabel>
                  <SelectItem value="In">Masuk</SelectItem>
                  <SelectItem value="Out">Keluar</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4 py-4">
            <Label htmlFor="time">Waktu</Label>
            <div className="grid grid-cols-2 items-center gap-4 col-span-3">
              <Select name="hours">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Jam" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Jam</SelectLabel>
                    {Array.from({ length: 24 }, (_, i) => (
                      <SelectItem key={i} value={i.toString().padStart(2, '0')}>
                        {i.toString().padStart(2, '0')}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Select name="minutes">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Menit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Menit</SelectLabel>
                    {Array.from({ length: 60 }, (_, i) => (
                      <SelectItem key={i} value={i.toString().padStart(2, '0')}>
                        {i.toString().padStart(2, '0')}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount">Jumlah</Label>
              <Input type="number" id="amount" name="amount" className="col-span-3" placeholder="Jumlah" />
            </div>
          </div>
          <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 hover:text-white text-white">
            Input Laporan
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
