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
import { Pencil, PlusCircle } from "lucide-react";
import { DialogClose } from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { formatCurrency, formatCurrencyInput } from "@/lib/number";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUserStore } from "@/store/user-store";
import toast from "react-hot-toast";

// Import ShadCN Select components
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface ProductFormState {
  id?: number;
  factory_id: string;
  product_id: string;
  sale_price: number;
  user_id: string;
  unit: string;
}

export default function Form({
  data,
  products,
}: {
  data?: any;
  products?: any;
}) {
  const { user } = useUserStore();
  const [product, setProduct] = useState<any>(null);
  // const fetchProduct = async (id: string) => {
  //   const response = await fetch(`/api/product/${id}`);
  //   const data = await response.json();
  //   setProduct(data);
  // }

  useEffect(() => {
    if (data) {
      setProduct(products?.find((product: any) => product.id == data.product_id));
    }
  }, [data]);

  const [state, setState] = useState<ProductFormState>({
    product_id: data?.product_id || "",
    sale_price: data?.sale_price || 0,
    id: data?.id || 0,
    factory_id: user?.factory_selected?.id.toString() || "",
    user_id: user?.id.toString() || "",
    unit: "pack",
  });

  

  const convertToPackPrice = (price: number, unit: string): number => {
    switch (unit) {
      case "slop":
        return price / 10;
      case "bal":
        return price / 200;
      case "karton":
        return price / 800;
      default:
        return price;
    }
  };

  const createProduct = async () => {
    let response;
    state.factory_id = user?.factory_selected?.id.toString() || "";
    state.user_id = user?.id.toString() || "";
    
    // Convert price to pack price before saving
    const packPrice = convertToPackPrice(state.sale_price, state.unit);

    if (state.id) {
      response = await fetch("/api/distributor/data-produk", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...state,
          sale_price: packPrice,
        }),
      });
    } else {
      response = await fetch("/api/distributor/data-produk/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: state.product_id,
          sale_price: packPrice,
          factory_id: state.factory_id,
          user_id: state.user_id,
        }),
      });
    }
    const data = await response.json();
    return data;
  };

  const useAddProductPrice = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: () => createProduct(),
      onSuccess: (data: any) => {
        if (data.error) {
          throw new Error(data.error);
        }
        toast.success(data.message);
        queryClient.invalidateQueries({ queryKey: ["product-distributor"] });
        // clear state
        setState({
          product_id: "",
          sale_price: 0,
          id: 0,
          user_id: user?.id.toString() || "",
          factory_id: user?.factory_selected?.id.toString() || "",
          unit: "pack",
        });
      },
      onError: (error: any) => {
        toast.error(error.message);
      },
    });
  };

  const { mutate } = useAddProductPrice();

  return (
    <Dialog>
      <DialogTrigger asChild>
        {data ? (
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
          <DialogTitle>Tambah Produk</DialogTitle>
          <DialogDescription>
            Masukkan nama untuk menambah produk baru. Klik tombol simpan untuk
            menyimpan data.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            mutate();
          }}
        >
          <div className="grid gap-4 py-4">
            <Label htmlFor="product_id">Pilih Produk</Label>
            {!(data) ? (
              <Select
                onValueChange={(value) => {
                  setState({ ...state, product_id: value });
                  setProduct(products?.find((product: any) => product.id == value));
                }}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Pilih Produk">
                    {products?.find(
                      (product: any) => product.id == state.product_id
                    )?.name || "Pilih Produk"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {products?.map((product: any) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                  {
                    products?.length < 0 && (
                      <SelectItem value="0">
                        Belum ada produk
                      </SelectItem>
                    )
                  }
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="product_id"
                name="product_id"
                className="col-span-3"
                value={products?.find(
                  (product: any) => product.id == state.product_id
                )?.name || ""}
                onChange={(e) =>
                  setState({ ...state, product_id: e.target.value })
                }
                disabled
              />
            )}
          </div>
          <div className="grid gap-4">
            <Label htmlFor="cost">Harga Beli/Pack (Pabrik)</Label>
            <Input
              id="cost"
              name="cost"
              className="col-span-3"
              value={formatCurrency(product?.price || 0)}
              disabled
            />
          </div>
          <div className="grid gap-4 my-3">
            <Label htmlFor="unit">Satuan</Label>
            <Select
              value={state.unit}
              onValueChange={(value) => setState({ ...state, unit: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih Satuan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pack">Pack</SelectItem>
                <SelectItem value="slop">Slop/Press (10 Pack)</SelectItem>
                <SelectItem value="bal">Bal (200 Pack)</SelectItem>
                <SelectItem value="karton">Karton (800 Pack)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-4 my-3">
            <Label htmlFor="sale_price">Harga per {state.unit}</Label>
            <Input
              id="sale_price"
              name="sale_price"
              className="col-span-3"
              value={formatCurrency(state.sale_price)}
              onChange={(e) =>
                setState({ ...state, sale_price: formatCurrencyInput(e) })
              }
            />
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
            <DialogClose asChild>
              <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
                Simpan
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
