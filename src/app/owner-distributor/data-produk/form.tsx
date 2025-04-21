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
import { Pencil, PlusCircle, Save, X } from "lucide-react";
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
  product_type?: string;
  purchase_price?: number;
}

export default function Form({
  data,
  products,
  factory,
}: {
  data?: any;
  products?: any[];
  factory?: any[];
}) {
  const { user } = useUserStore();
  const [product, setProduct] = useState<any>(null);
  const [factorySelected, setFactorySelected] = useState<any>(
    data?.factory_id == null ? "all" : data?.factory_id
  );
  const [isOtherProduct, setIsOtherProduct] = useState(false);

  // Konversi products ke array jika undefined atau bukan array
  const productsArray = Array.isArray(products) ? products : [];

  useEffect(() => {
    if (data) {
      setProduct(
        productsArray.find((product: any) => product.id == data.product_id)
      );
    }
  }, [data]);

  const [state, setState] = useState<ProductFormState>({
    product_id: data?.product_id || "",
    sale_price: data?.sale_price || 0,
    id: data?.id || 0,
    factory_id: user?.factory_selected?.id.toString() || "",
    user_id: user?.id.toString() || "",
    unit: "pack",
    product_type: "",
    purchase_price: 0,
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
    // state.factory_id = ambil dari data product yang dipilih
    state.user_id = user?.id.toString() || "";

    const packPrice = convertToPackPrice(state.sale_price, state.unit);

    const payload = {
      ...state,
      sale_price: packPrice,
      ...(isOtherProduct && {
        product_type: state.product_type,
        purchase_price: state.purchase_price,
      }),
    };

    if (state.id) {
      response = await fetch("/api/distributor/data-produk", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      response = await fetch("/api/distributor/data-produk/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
          product_type: "",
          purchase_price: 0,
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
          <Button
            type="button"
            disabled={!data}
            variant="ghost"
            className="w-full flex justify-start px-2"
          >
            <Pencil className="w-4 h-4 mr-1" />
            Edit
          </Button>
        ) : (
          <Button
            type="button"
            variant="ghost"
            disabled={products?.length == 0}
            className="bg-blue-500 hover:bg-blue-600 flex justify-end px-4 text-white hover:text-white"
          >
            <PlusCircle className="w-4 h-4" />
            Tambah Produk
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
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
          <div className="grid grid-cols-2 gap-4 py-4">
            {
              !data && (
            
            <div className="flex flex-col gap-4">
              <Label htmlFor="product_id">Kategori Produk: </Label>
              <Select
                value={factorySelected?.id}
                onValueChange={(value) => {
                  // jika value adalah all maka set isOtherProduct menjadi true
                  if (value == "all") {
                    setIsOtherProduct(true);
                  } else {
                    setIsOtherProduct(false);
                  }
                  setFactorySelected(factory?.find((factory: any) => factory.id == value));
                }}
                disabled={factory?.length === 0}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih Kategori"></SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Baru</SelectItem>
                  <SelectItem value="exist">Sudah ada</SelectItem>
                </SelectContent>
              </Select>
              </div>
            )}

            {!data && (
              <div className="flex flex-col gap-4">
                <Label htmlFor="product_id">
                  {isOtherProduct ? "Nama Produk" : "Pilih Produk"}
                </Label>
                {isOtherProduct ? (
                  <Input
                    id="product_id"
                    name="product_id"
                    className="w-full"
                    placeholder="Masukkan nama produk"
                    value={state.product_id}
                    onChange={(e) =>
                      setState({ ...state, product_id: e.target.value })
                    }
                  />
                ) : (
                  <Select
                    onValueChange={(value) => {
                      const selectedProduct = products?.find(
                        (product: any) => product.id == value
                      );
                      setState({
                        ...state,
                        product_id: value,
                        factory_id: selectedProduct?.factory_id || "",
                      });
                      setProduct(selectedProduct);
                      // set pilihan kategori produk ke exist
                      setFactorySelected({
                        id: "exist",
                        name: "Sudah ada",
                      });
                    }}
                    value={state.product_id}
                    disabled={products?.length === 0}
                  >
                    <SelectTrigger className="w-full">
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
                      {products?.length == 0 && (
                        <SelectItem value="0">Belum ada produk</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}
            {
              data && (
                <div className="flex flex-col gap-4 col-span-2">
                  <Label htmlFor="product_id">Nama Produk: </Label>
                  <Input
                    id="product_id"
                    name="product_id"
                    className="w-full"
                    value={data.name || ""}
                    disabled
                  />
                </div>
              )
            }
          </div>
          {!isOtherProduct && (
            <>
              <div className="grid gap-4 py-4">
                <Label htmlFor="cost">Harga Beli/Pack (Pabrik)</Label>
                <Input
                  id="cost"
                  name="cost"
                  className="col-span-3"
                  value={formatCurrency(product?.price || 0)}
                  disabled
                />
              </div>
              <div className="grid gap-4 py-4">
                <Label htmlFor="cost">Harga Beli/Bal (Pabrik)</Label>
                <Input
                  id="cost"
                  name="cost"
                  className="col-span-3"
                  value={formatCurrency(product?.price * (product?.per_bal || 200) || 0)}
                  disabled
                />
              </div>
            </>
          )}
          {isOtherProduct && (
            <>
              <div className="grid gap-4 py-4">
                <Label htmlFor="product_type">Tipe Produk</Label>
                <Select
                  value={state.product_type}
                  onValueChange={(value) =>
                    setState({ ...state, product_type: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih Tipe Produk" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SKM">SKM</SelectItem>
                    <SelectItem value="SKT">SKT</SelectItem>
                    <SelectItem value="SPM">SPM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-4 py-4">
                <Label htmlFor="purchase_price">Harga Beli/Pack</Label>
                <Input
                  id="purchase_price"
                  name="purchase_price"
                  className="col-span-3"
                  value={formatCurrency(state.purchase_price || 0)}
                  onChange={(e) =>
                    setState({
                      ...state,
                      purchase_price: formatCurrencyInput(e),
                    })
                  }
                />
              </div>
            </>
          )}
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
                <X className="w-4 h-4 mr-1" />
                Batal
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
                <Save className="w-4 h-4 mr-1" />
                Simpan
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
