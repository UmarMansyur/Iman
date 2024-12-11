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
import { PriceProductUnit, PriceProductUnitFormState } from "@/lib/definitions";
import { Check, ChevronsUpDown, Pencil, PlusCircle } from "lucide-react";
import { DialogClose } from "@radix-ui/react-dialog";
import toast from "react-hot-toast";
import { Product } from "@prisma/client";
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
import createPriceProductUnit from "@/app/actions/price-product-unit";

export default function Form({
  priceProductUnit,
  fetchData,
  options,
}: {
  priceProductUnit?: PriceProductUnit;
  fetchData: () => Promise<void>;
  options: { products: any};
}) {
  const [state, setState] = useState<PriceProductUnitFormState>();
  const [productOpen, setProductOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const statuss = [
    {
      id: "Active",
      name: "Aktif",
    },
    {
      id: "Inactive",
      name: "Tidak Aktif",
    },
  ]
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append("id", priceProductUnit?.id.toString() || "");
    formData.append("product_unit_id", selectedProduct?.id.toString() || "");
    formData.append("price", formData.get("price")?.toString() || "0");
    formData.append("sale_price", formData.get("sale_price")?.toString() || "0");
    formData.append("status", formData.get("status")?.toString() || "Active");

    const response = await createPriceProductUnit(undefined, formData);
    console.log(response);
    if (response?.errors) {
      setState(response.errors as PriceProductUnitFormState);
      toast.error(
        response?.errors.product_unit_id?.join(", ") ||
          "Gagal memperbarui harga produk"
      );
    } else {
      toast.success(
        response?.message || "Satuan produk berhasil diperbarui"
      );
    }
    await fetchData();
  };

  useEffect(() => {
    if (priceProductUnit) {
      setSelectedProduct(
        options.products.find((product: Product) => product.id === priceProductUnit.product_unit_id) || null
      );
    }
  }, [priceProductUnit, options]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        {priceProductUnit ? (
          <Button variant="ghost" className="w-full flex justify-start px-2">
            <Pencil className="w-4 h-4" />
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
            {priceProductUnit ? "Edit Harga Produk" : "Tambah Harga Produk"}
          </DialogTitle>
          <DialogDescription>
            Masukkan data untuk{" "}
            {priceProductUnit
              ? "mengubah harga produk"
              : "menambah harga produk"}
            . Klik tombol simpan untuk menyimpan{" "}
            {priceProductUnit ? "perubahan" : "harga produk"}.
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
                    {options.products.find((product: Product) => product.id === priceProductUnit?.product_unit_id)?.name || selectedProduct?.name ||
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
                                  priceProductUnit?.product_unit_id === product.id
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
              {state?.errors?.product_unit_id && <p className="text-red-500 text-sm">{state.errors.product_unit_id.join(", ")}</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="product">Status</Label>
              <Popover open={statusOpen} onOpenChange={setStatusOpen}>
                <PopoverTrigger asChild className="col-span-3" name="status">
                  <Button
                    variant="ghost"
                    role="combobox"
                    className="justify-between col-span-3 bg-white border border-gray-300 text-black"
                  >
                    {/* {statuss.find((status: any) => status.id === priceProductUnit?.status)?.name || statuss.find((status: any) => selectedStatus === status.id)?.name ||
                      "Pilih Status..."} */}
                      {statuss.find((item: any) => selectedStatus === item.id)?.name || statuss.find((item: any) => priceProductUnit?.status === item.id)?.name || "Pilih Status..."}
                    <ChevronsUpDown className="opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 justify-between">
                  <Command>
                    <CommandInput placeholder="Search status..." />
                    <CommandList>
                      <CommandEmpty>
                        Tidak ada status yang ditemukan.
                      </CommandEmpty>
                      <CommandGroup>
                        <ScrollArea className="h-[200px]">
                          {statuss.map((status: any) => (
                            <CommandItem
                              key={status.name}
                              value={status.id}
                              onSelect={() => {
                                setSelectedStatus(status.id);
                                setStatusOpen(false);
                              }}
                            >
                              {status.name}
                              <Check
                                className={cn(
                                  "ml-auto",
                                  priceProductUnit?.status === status.id
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
              {state?.errors?.status && <p className="text-red-500 text-sm">{state.errors.status.join(", ")}</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount">Harga Jual</Label>
              <Input
                type="number"
                id="sale_price"
                name="sale_price"
                defaultValue={priceProductUnit?.sale_price || 0}
                className="col-span-3"
              />
              {state?.errors?.sale_price && <p className="text-red-500 text-sm">{state.errors.sale_price.join(", ")}</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount">Harga Produksi</Label>
              <Input
                type="number"
                id="price"
                name="price"
                defaultValue={priceProductUnit?.price || 0}
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
