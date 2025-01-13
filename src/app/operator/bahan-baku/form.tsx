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
import { MaterialUnit, MaterialUnitFormState } from "@/lib/definitions";
import { Check, ChevronsUpDown, Pencil, PlusCircle } from "lucide-react";
import { DialogClose } from "@radix-ui/react-dialog";
import toast from "react-hot-toast";
import { useUserStore } from "@/store/user-store";
import createMaterialUnit from "@/app/actions/material-unit";
import { Material, Unit } from "@prisma/client";
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
  materialUnit?: MaterialUnit;
  fetchData: () => Promise<void>;
  options: any;
}) {
  const [state, setState] = useState<MaterialUnitFormState>();
  const { user } = useUserStore();
  const [unitOpen, setUnitOpen] = useState(false);
  const [material, setMaterial] = useState<string | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append("id", materialUnit?.id?.toString() || "");
    formData.append("factory_id", user?.factory_selected?.id?.toString() || "");
    formData.append("material_id", material || "");
    formData.append("unit_id", selectedUnit?.id?.toString() || "");
    const response = await createMaterialUnit(undefined, formData);

    if (response?.errors) {
      setState(response.errors as MaterialUnitFormState);
      toast.error(
        response?.errors.material_id?.join(", ") ||
          "Gagal memperbarui satuan bahan baku"
      );
    } else {
      toast.success(
        response?.message || "Satuan bahan baku berhasil diperbarui"
      );
    }
    await fetchData();
  };

  useEffect(() => {
    if (materialUnit) {
      setMaterial(options.materials.find((material: Material) => material.id === materialUnit.material_id)?.name);
      setSelectedUnit(options.units.find((unit: Unit) => unit.id === materialUnit.unit_id));
    }
  }, [materialUnit, options]);

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
            className="bg-blue-500 hover:bg-blue-600 flex justify-end px-4 text-white hover:text-white"
          >
            <PlusCircle className="w-4 h-4" />
            Tambah
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
              {state?.errors?.material_id && <p className="text-red-500 text-sm">{state.errors.material_id.join(", ")}</p>}
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
                    {selectedUnit?.name || options.units.find((unit: Unit) => unit.id === materialUnit?.unit_id)?.name || "Pilih Satuan..."}
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
              {state?.errors?.unit_id && <p className="text-red-500 text-sm">{state.errors.unit_id.join(", ")}</p>}
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
