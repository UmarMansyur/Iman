/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { Check, ChevronsUpDown, Pencil, PlusCircle } from "lucide-react";
import { DialogClose } from "@radix-ui/react-dialog";
import toast from "react-hot-toast";
import { useUserStore } from "@/store/user-store";
import { Unit } from "@prisma/client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

export default function Form({
  materialUnit,
  fetchData,
  options,
}: {
  materialUnit?: any;
  fetchData: () => Promise<void>;
  options: any;
}) {
  const { user } = useUserStore();
  const [unitOpen, setUnitOpen] = useState(false);
  const [material, setMaterial] = useState<string | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);

  useEffect(() => {
    if(materialUnit) {
      console.log(materialUnit);
      setMaterial(materialUnit.name);
      setSelectedUnit(options.units.find((unit: Unit) => unit.id === materialUnit.unit_id) || null);
    }
  }, [materialUnit]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let url = '';
    let method = "";
    if(materialUnit) {
      url = '/api/distributor/bahan-baku/' + materialUnit?.id.toString();
      method = 'PUT';
    } else {
      url = '/api/distributor/bahan-baku';
      method = 'POST';
    }

    const response = await fetch(url, {
      method: method,
      body: JSON.stringify({
        user_id: user?.id.toString(),
        name: material,
        unit_id: selectedUnit?.id.toString(),
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    if (response.ok) {
      toast.success(data.message);
    } else {
      toast.error(data.message);
    }

    await fetchData();
  };


  return (
    <Dialog>
      <DialogTrigger asChild>
        {materialUnit ? (
          <Button variant="ghost" className="w-full flex justify-start px-2">
            <Pencil className="w-4 h-4 mr-1" />
            Edit
          </Button>
        ) : (
          <Button
            variant="ghost"
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-500 hover:to-blue-600 flex justify-end px-4 text-white hover:text-white rounded-md"
          >
            <PlusCircle className="w-4 h-4" />
            Tambah Bahan Baku
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {materialUnit ? "Edit Bahan Baku" : "Tambah Bahan Baku"}
          </DialogTitle>
          <DialogDescription>
            Masukkan nama baru untuk{" "}
            {materialUnit
              ? "mengubah satuan bahan baku"
              : "menambah satuan bahan baku"}
            . Klik tombol simpan untuk menyimpan{" "}
            {materialUnit ? "perubahan" : "satuan bahan baku"}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="material">Bahan Baku</Label>
              <Input type="text" name="material_id" id="material_id" className="col-span-3" value={material || ""} onChange={(e: any) => setMaterial(e.target.value)}/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="unit">Satuan</Label>
              <Popover open={unitOpen} onOpenChange={setUnitOpen} modal={true}>
                <PopoverTrigger asChild className="col-span-3" name="unit_id">
                  <Button
                    variant="ghost"
                    role="combobox"
                    className="justify-between col-span-3 bg-white border border-gray-300 text-black"
                  >
                    {selectedUnit?.name || "Pilih Satuan..."}
                    <ChevronsUpDown className="opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 justify-between">
                  <Command>
                    <CommandInput placeholder="Search satuan..." />
                    <CommandList>
                      <CommandEmpty>
                        Tidak ada satuan yang ditemukan. Hubungi vendor untuk menambahkan satuan.
                      </CommandEmpty>
                      <CommandGroup>
                        <ScrollArea className="h-[200px]">
                          {options.units.map((unit: Unit) => (
                            <CommandItem
                              key={unit.name}
                              value={unit.name}
                              onSelect={() => {
                                setSelectedUnit(unit);
                                setUnitOpen(false);
                              }}
                            >
                              {unit.name}
                              <Check
                                className={cn(
                                  "ml-auto",
                                  selectedUnit?.id === unit.id
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
