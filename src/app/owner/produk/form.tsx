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
import { useEffect, useState } from "react";
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
  product?: { id: number; name: string; type: ProductType; price: number; per_slop: number; per_bal: number; per_karton: number };
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const price = formData.get("price")?.toString().replace(/\./g, "") || "";
    const per_slop = formData.get("per_slop")?.toString().replace(/\./g, "") || "10";
    const per_bal = formData.get("per_bal")?.toString().replace(/\./g, "") || "200";
    const per_karton = formData.get("per_karton")?.toString().replace(/\./g, "") || "800";

    if (selectedUnit === "Pack") {
      formData.set("price", price);
    } else if (selectedUnit === "Bal") {
      formData.set("price", (Number(price) / Number(per_bal)).toString());
    } else if (selectedUnit === "Slop/Press") {
      formData.set("price", (Number(price) / Number(per_slop)).toString());
    } else if (selectedUnit === "Karton") {
      formData.set("price", (Number(price) / Number(per_karton)).toString());
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

  useEffect(() => {
    if (!product) {
      const per_slop = document.getElementById("per_slop") as HTMLInputElement;
      const per_bal = document.getElementById("per_bal") as HTMLInputElement;
      const per_karton = document.getElementById("per_karton") as HTMLInputElement;
      if (per_slop) {
        per_slop.value = "10";
      }
      if (per_bal) {
        per_bal.value = "200";
      }
      if (per_karton) {
        per_karton.value = "800";
      }
    }
  }, [product]);

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
                    <SelectItem value="SKM">SKM</SelectItem>
                    <SelectItem value="SKT">SKT</SelectItem>
                    <SelectItem value="SPM">SPM</SelectItem>
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
              <Label htmlFor="per_slop">Pack to Slop</Label>
              <Input
                id="per_slop"
                name="per_slop"
                defaultValue={product?.per_slop?.toString()}
                placeholder="10"
                className="col-span-3"
                // isi nilai default
                onChange={(e) => {
                  e.target.value = formatPrice(e.target.value);
                }}
              />
              {state?.errors?.per_slop && (
                <p className="text-red-500 col-span-3 col-start-2">
                  {state.errors.per_slop.join(", ")}
                </p>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="per_bal">Pack to Bal</Label>
              <Input
                id="per_bal"
                name="per_bal"
                defaultValue={product?.per_bal?.toString()}
                placeholder="200"
                className="col-span-3"
                onChange={(e) => {
                  e.target.value = formatPrice(e.target.value);
                }}
              />
              {state?.errors?.per_bal && (
                <p className="text-red-500 col-span-3 col-start-2">
                  {state.errors.per_bal.join(", ")}
                </p>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="per_karton">Pack to Karton</Label>
              <Input
                id="per_karton"
                name="per_karton"
                defaultValue={product?.per_karton?.toString()}
                placeholder="800"
                className="col-span-3"
              />
              {state?.errors?.per_karton && (
                <p className="text-red-500 col-span-3 col-start-2">
                  {state.errors.per_karton.join(", ")}
                </p>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price">Satuan Harga</Label>
              <Select value={selectedUnit} onValueChange={setSelectedUnit}>
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
