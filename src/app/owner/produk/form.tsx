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
import { ProductFormState } from "@/lib/definitions";
import { Pencil, PlusCircle } from "lucide-react";
import { DialogClose } from "@radix-ui/react-dialog";
import toast from "react-hot-toast";
import { ProductType } from "@prisma/client";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectGroup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import createProduct from "@/app/actions/product";
import { useUserStore } from "@/store/user-store";

export default function Form({
  product,
  fetchData,
}: {
  product?: { id: number; name: string; type: ProductType; price: number; per_bal: number; per_karton: number; per_slop: number };
  fetchData: () => Promise<void>;
}) {
  const [state, setState] = useState<ProductFormState>();
  const { user } = useUserStore();
  const [selectedUnit, setSelectedUnit] = useState("Pack");
  const [loading, setLoading] = useState(false);
  const formatPrice = (value: string) => {
    const number = value.replace(/\D/g, "");
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const convertPrice = (value: number, to: string) => {
    let result = 0;
    if (selectedUnit === "Bal") {
      result = value / 200;
    } else if (selectedUnit === "Karton") {
      result = value / 800;
    } else if (selectedUnit === "Slop") {
      result = value / 10;
    } else if (selectedUnit === "Pack") {
      result = value;
    }

    if (to === "Pack") {
      return result;
    } else if (to === "Bal") {
      return result * (product?.per_bal || 200);
    } else if (to === "Slop/Press") {
      return result * (product?.per_slop || 10);
    } else if (to === "Karton") {
      return result * (product?.per_karton || 800);
    } else {
      return result;
    }
  };

  const handleUnitChange = (value: string) => {
    const priceInput = document.getElementById("price") as HTMLInputElement;
    const price = convertPrice(Number(priceInput.value.replace(/\./g, "")), value);
    setSelectedUnit(value);
    priceInput.value = price.toLocaleString("id-ID").replace(/,/g, ".");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const price = formData.get("price")?.toString().replace(/\./g, "") || "";

    if (selectedUnit === "Pack") {
      formData.set("price", price);
    } else if (selectedUnit === "Bal") {
      formData.set("price", (Number(price) / 200).toString());
    } else if (selectedUnit === "Slop/Press") {
      formData.set("price", (Number(price) / 10).toString());
    } else if (selectedUnit === "Karton") {
      formData.set("price", (Number(price) / 800).toString());
    }

    formData.append("id", product?.id?.toString() || "");
    formData.append("factory_id", user?.factory_selected?.id?.toString() || "");

    const response = await createProduct(undefined, formData);

    if (response?.errors) {
      setState(response.errors as ProductFormState);
      toast.error(
        response?.errors.name?.join(", ") || "Gagal memperbarui produk"
      );
    } else {
      toast.success(response?.message || "Produk berhasil diperbarui");
    }
    await fetchData();
    setLoading(false);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {product ? (
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
            Tambah Produk
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{product ? "Edit Produk" : "Tambah Produk"}</DialogTitle>
          <DialogDescription>
            Masukkan data produk untuk{" "}
            {product ? "mengubah produk" : "menambah produk baru"}. Klik tombol
            simpan untuk menyimpan {product ? "perubahan" : "produk"}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name">Nama</Label>
              <Input
                id="name"
                name="name"
                defaultValue={product?.name}
                placeholder="Masukkan Nama"
                className="col-span-3"
              />
              {state?.errors?.name && (
                <p className="text-red-500 col-span-3 col-start-2">
                  {state.errors.name.join(", ")}
                </p>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type">Jenis</Label>
              <Select name="type" defaultValue={product?.type}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Pilih Jenis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="Kretek">Kretek</SelectItem>
                    <SelectItem value="Gabus">Gabus</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              {state?.errors?.type && (
                <p className="text-red-500 col-span-3 col-start-2">
                  {state.errors.type.join(", ")}
                </p>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price">Satuan Harga</Label>
              <Select value={selectedUnit} onValueChange={handleUnitChange}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Pilih Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pack">Pack</SelectItem>
                  <SelectItem value="Bal">Bal</SelectItem>
                  <SelectItem value="Slop/Press">Slop/Press</SelectItem>
                  <SelectItem value="Karton">Karton</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price">Harga</Label>
              <Input
                id="price"
                name="price"
                defaultValue={product?.price
                  ?.toLocaleString("id-ID")
                  .replace(/,/g, ".")}
                placeholder="Rp. 0"
                className="col-span-3"
                onChange={(e) => {
                  e.target.value = formatPrice(e.target.value);
                }}
              />
              {state?.errors?.price && (
                <p className="text-red-500 col-span-3 col-start-2">
                  {state.errors.price.join(", ")}
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
            <Button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600"
              disabled={loading}
            >
              Simpan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
