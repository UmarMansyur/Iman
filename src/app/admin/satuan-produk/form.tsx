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
import { ProductUnit, ProductUnitFormState } from "@/lib/definitions";
import { Check, ChevronsUpDown, Pencil, PlusCircle } from "lucide-react";
import { DialogClose } from "@radix-ui/react-dialog";
import toast from "react-hot-toast";
import { useUserStore } from "@/store/user-store";
import createProductUnit from "@/app/actions/product-unit";
import { Product, Unit } from "@prisma/client";
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
  productUnit,
  fetchData,
  options,
}: {
  productUnit?: ProductUnit;
  fetchData: () => Promise<void>;
  options: { products: Product[], units: Unit[] };
}) {
  const [state, setState] = useState<ProductUnitFormState>();
  const { user } = useUserStore();
  const [productOpen, setProductOpen] = useState(false);
  const [unitOpen, setUnitOpen] = useState(false);
  const [parentOpen, setParentOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [selectedParent, setSelectedParent] = useState<Unit | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append("id", productUnit?.id.toString() || "");
    formData.append("factory_id", user?.factory_selected?.id?.toString() || "");
    formData.append("product_id", selectedProduct?.id.toString() || "");
    formData.append("unit_id", selectedUnit?.id.toString() || "");
    formData.append("amount", formData.get("amount")?.toString() || "0");
    formData.append("parent_id", selectedParent?.id.toString() || "");
    formData.append("convert_from_parent", formData.get("convert_from_parent")?.toString() || "0");
    const response = await createProductUnit(undefined, formData);
    if (response?.errors) {
      setState(response.errors as ProductUnitFormState);
      toast.error(
        response?.errors.product_id?.join(", ") ||
          "Gagal memperbarui satuan produk"
      );
    } else {
      toast.success(
        response?.message || "Satuan produk berhasil diperbarui"
      );
    }
    await fetchData();
  };

  useEffect(() => {
    if (productUnit) {
      setSelectedProduct(
        options.products.find((product: Product) => product.id === productUnit.product_id) || null
      );
      setSelectedUnit(
        options.units.find((unit: Unit) => unit.id === productUnit.unit_id) || null
      );
    }
  }, [productUnit, options]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        {productUnit ? (
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
            {productUnit ? "Edit Satuan Produk" : "Tambah Satuan Produk"}
          </DialogTitle>
          <DialogDescription>
            Masukkan data untuk{" "}
            {productUnit
              ? "mengubah satuan produk"
              : "menambah satuan produk"}
            . Klik tombol simpan untuk menyimpan{" "}
            {productUnit ? "perubahan" : "satuan produk"}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="product">Produk</Label>
              <Popover open={productOpen} onOpenChange={setProductOpen}>
                <PopoverTrigger asChild className="col-span-3" name="product_id">
                  <Button
                    variant="ghost"
                    role="combobox"
                    className="justify-between col-span-3 bg-white border border-gray-300 text-black"
                  >
                    {selectedProduct?.name ||
                      options.products.find((product: Product) => product.id === productUnit?.product_id)?.name ||
                      "Pilih Produk..."}
                    <ChevronsUpDown className="opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 justify-between">
                  <Command>
                    <CommandInput placeholder="Search produk..." />
                    <CommandList>
                      <CommandEmpty>
                        Tidak ada produk yang ditemukan.
                      </CommandEmpty>
                      <CommandGroup>
                        <ScrollArea className="h-[200px]">
                          {options.products.map((product: Product) => (
                            <CommandItem
                              key={product.name}
                              value={product.name}
                              onSelect={() => {
                                setSelectedProduct(product);
                                setProductOpen(false);
                              }}
                            >
                              {product.name}
                              <Check
                                className={cn(
                                  "ml-auto",
                                  selectedProduct?.id === product.id
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
              {state?.errors?.product_id && <p className="text-red-500 text-sm">{state.errors.product_id.join(", ")}</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="unit">Sub Satuan: </Label>
              <Popover open={unitOpen} onOpenChange={setUnitOpen}>
                <PopoverTrigger asChild className="col-span-3" name="unit_id">
                  <Button
                    variant="ghost"
                    role="combobox"
                    className="justify-between col-span-3 bg-white border border-gray-300 text-black"
                  >
                    {selectedUnit?.name ||
                      options.units.find((unit: Unit) => unit.id === productUnit?.unit_id)?.name ||
                      "Pilih Sub Satuan..."}
                    <ChevronsUpDown className="opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 justify-between">
                  <Command>
                    <CommandInput placeholder="Search satuan..." />
                    <CommandList>
                      <CommandEmpty>
                        Tidak ada sub satuan yang ditemukan.
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount">Jumlah</Label>
              <Input
                type="number"
                id="amount"
                name="amount"
                defaultValue={productUnit?.amount || 0}
                className="col-span-3"
              />
              {state?.errors?.amount && <p className="text-red-500 text-sm">{state.errors.amount.join(", ")}</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="unit">Satuan Pokok</Label>
              <Popover open={parentOpen} onOpenChange={setParentOpen}>
                <PopoverTrigger asChild className="col-span-3" name="parent_id">
                  <Button
                    variant="ghost"
                    role="combobox"
                    className="justify-between col-span-3 bg-white border border-gray-300 text-black"
                  >
                    {selectedParent?.name ||
                      options.units.find((unit: Unit) => unit.id === productUnit?.parent_id)?.name ||
                      "Pilih Satuan..."}
                    <ChevronsUpDown className="opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 justify-between">
                  <Command>
                    <CommandInput placeholder="Search satuan..." />
                    <CommandList>
                      <CommandEmpty>
                        Tidak ada satuan yang ditemukan.
                      </CommandEmpty>
                      <CommandGroup>
                        <ScrollArea className="h-[200px]">
                          {options.units
                            .filter((unit: Unit) => unit.id !== selectedUnit?.id)
                            .map((unit: Unit) => (
                              <CommandItem
                                key={unit.name}
                                value={unit.name}
                                onSelect={() => {
                                  setSelectedParent(unit);
                                  setParentOpen(false);
                                }}
                              >
                                {unit.name}
                                <Check
                                  className={cn(
                                    "ml-auto",
                                    selectedParent?.id === unit.id
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
              {state?.errors?.parent_id && <p className="text-red-500 text-sm">{state.errors.parent_id.join(", ")}</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount">Jumlah Konversi Sub Satuan</Label>
              <Input
                type="number"
                id="convert_from_parent"
                name="convert_from_parent"
                placeholder="Contoh: 10 per unit satuan produk"
                defaultValue={productUnit?.convert_from_parent || 0}
                className="col-span-3 px-2 py-1 border border-gray-300 rounded-md"
              />
              {state?.errors?.convert_from_parent && <p className="text-red-500 text-sm">{state.errors.convert_from_parent.join(", ")}</p>}
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
