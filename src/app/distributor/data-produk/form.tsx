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
  purchase_unit?: string;
  per_slop?: number;
  per_bal?: number;
  per_karton?: number;
  per_pack?: number;
}

export default function Form({
  data,
  products,
}: {
  data?: any;
  products?: any[];
  factory?: any[];
}) {
  const { user } = useUserStore();
  const [product, setProduct] = useState<any>(null);
  const [isOtherProduct, setIsOtherProduct] = useState(false);

  const productsArray = Array.isArray(products) ? products : [];

  useEffect(() => {
    if (data) {
      setProduct(
        productsArray.find((product: any) => product.id == data.product_id)
      );
      setState(prevState => ({
        ...prevState,
        product_id: data.product_id,
        sale_price: data.sale_price,
        id: data.id,
        factory_id: data.factory_id,
        unit: data.unit || "pack",
        per_slop: data?.per_slop,
        per_bal: data?.per_bal,
        per_karton: data?.per_karton,
        purchase_price: data.price || 0,
        purchase_unit: data.purchase_unit || "pack",
        product_type: data.product_type || "",
      }));
      setIsOtherProduct(data.factory_id == null)
    }
  }, [data, products]);

  const [state, setState] = useState<ProductFormState>({
    product_id: data?.product_id || "",
    sale_price: data?.sale_price || 0,
    id: data?.id || 0,
    factory_id: user?.factory_selected?.id.toString() || "",
    user_id: user?.id.toString() || "",
    unit: "pack",
    product_type: "",
    purchase_price: 0,
    purchase_unit: "pack",
    per_slop: product?.per_slop || 10,
    per_bal: product?.per_bal || 200,
    per_karton: product?.per_karton || 800,
    per_pack: 1,
  });

  const convertToPackPrice = (price: number, unit: string, product_perbal: number, product_perkarton: number, product_perslop: number): number => {
    if (!price) return 0;
    
    switch (unit) {
      case "slop":
        return price / (product_perslop || 1);
      case "bal":
        return price / (product_perbal || 1);
      case "karton":
        return price / (product_perkarton || 1);
      default:
        return price;
    }
  };

  const createProduct = async () => {
    try {
      state.user_id = user?.id.toString() || "";

      // Konversi harga jual ke harga per pack
      const packPrice = convertToPackPrice(
        state.sale_price, 
        state.unit, 
        product?.per_bal || state.per_bal,
        product?.per_karton || state.per_karton,
        product?.per_slop || state.per_slop
      );
      
      let payload: any = {
        ...state,
        sale_price: packPrice,
        per_karton: product?.per_karton || state.per_karton,
        per_bal: product?.per_bal || state.per_bal,
        per_slop: product?.per_slop || state.per_slop,
        per_pack: 1,
      };

      // Logika untuk produk baru
      if (isOtherProduct) {
        const purchasePrice = convertToPackPrice(
          state.purchase_price || 0, 
          state.purchase_unit || "pack", 
          product?.per_bal || state.per_bal,
          product?.per_karton || state.per_karton,
          product?.per_slop || state.per_slop
        );

        payload = {
          ...payload,
          product_type: state.product_type,
          purchase_price: purchasePrice,
          per_slop: state.per_slop,
          per_bal: state.per_bal,
          per_karton: state.per_karton,
          per_pack: 1,
        };
      }
      const response = await fetch(`/api/distributor/data-produk${state.id ? "" : "/"}`, {
        method: state.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log(result)
      if (!response.ok) throw new Error(result.error || "Terjadi kesalahan");
      
      return result;
    } catch (error: any) {
      throw new Error(error.message || "Terjadi kesalahan saat menyimpan data");
    }
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
          purchase_unit: "pack",
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
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-700 flex justify-end px-4 text-white hover:text-white"
          >
            <PlusCircle className="w-4 h-4" />
            Tambah Produk
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{data ? "Edit" : "Tambah"} Produk</DialogTitle>
          <DialogDescription>
            {data ? "Edit" : "Masukkan data"} produk baru. Klik tombol simpan untuk
            menyimpan data.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            mutate();
          }}
        >
          <div className="grid grid-cols-2 gap-2 py-4">
            {!data && (
              <div className="flex flex-col gap-2 col-span-2">
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
                  <div className="col-span-2">
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
                      {products?.filter((product: any) => product.factory_id != null).map((product: any) => (
                        <SelectItem key={product.id} value={product.id.toString()}>
                          {product.name}
                        </SelectItem>
                      ))}
                      {products?.length == 0 && (
                        <SelectItem value="0">Belum ada produk</SelectItem>
                      )}
                    </SelectContent>
                  </Select>

                  </div>
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
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-4 py-4">
                <Label htmlFor="cost">Harga Beli/Pack</Label>
                <Input
                  id="cost"
                  name="cost"
                  className="col-span-3"
                  value={formatCurrency(data?.price || product?.price || 0)}
                  disabled
                />
              </div>
              <div className="grid gap-4 py-4">
                <Label htmlFor="cost">Harga Beli/Bal</Label>
                <Input
                  id="cost"
                  name="cost"
                  className="col-span-3"
                  value={formatCurrency((data?.price * data?.per_bal) || (product?.price * product?.per_bal) || 0)}
                  disabled
                />
              </div>
              <div className="grid gap-4 py-4">
                <Label htmlFor="cost">Harga Beli/Karton</Label>
                <Input
                  id="cost"
                  name="cost"
                  className="col-span-3"
                  value={formatCurrency((data?.price * data?.per_karton) || (product?.price * product?.per_karton) || 0)}
                  disabled
                />
              </div>
            </div>
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
                  disabled={data && data?.factory_id == null}
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
              <div className="grid grid-cols-3 gap-4 py-4">
                <div>
                  <Label htmlFor="per_slop">Pack per Slop</Label>
                  <Input
                    id="per_slop"
                    name="per_slop"
                    type="text"
                    className="mt-2"
                    value={(product?.per_slop ? product?.per_slop : state.per_slop) || ''}
                    onChange={(e) =>
                      setState({
                        ...state,
                        per_slop: parseInt(e.target.value),
                      })
                    }
                    maxLength={3}
                  />
                </div>
                <div>
                  <Label htmlFor="per_bal">Pack per Bal</Label>
                  <Input
                    id="per_bal"
                    name="per_bal"
                    type="text"
                    className="mt-2"
                    value={(product?.per_bal ? product?.per_bal : state.per_bal) || ''}
                    onChange={(e) =>
                      setState({
                        ...state,
                        per_bal: parseInt(e.target.value),
                      })
                    }
                    maxLength={3}
                  />
                </div>
                <div>
                  <Label htmlFor="per_karton">Pack per Karton</Label>
                  <Input
                    id="per_karton"
                    name="per_karton"
                    type="text"
                    className="mt-2"
                    value={(product?.per_karton ? product?.per_karton : state.per_karton) || ""}
                    // max 3 digit
                    maxLength={3}
                    onChange={(e) =>
                      setState({
                        ...state,
                        per_karton: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid gap-4 my-3">
                <Label htmlFor="purchase_unit">Satuan Harga Beli</Label>
                <Select
                  value={state.purchase_unit || "pack"}
                  onValueChange={(value) => setState({ ...state, purchase_unit: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih Satuan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pack">Pack</SelectItem>
                    <SelectItem value="slop">Slop/Press</SelectItem>
                    <SelectItem value="bal">Bal</SelectItem>
                    <SelectItem value="karton">Karton</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-4 py-4">
                <Label htmlFor="purchase_price">Harga Beli per {state.purchase_unit || "pack"}</Label>
                <Input
                  id="purchase_price"
                  name="purchase_price"
                  className="col-span-3"
                  type="text"
                  value={formatCurrency((state?.purchase_price) || 0)}
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
                <SelectItem value="slop">Slop/Press</SelectItem>
                <SelectItem value="bal">Bal</SelectItem>
                <SelectItem value="karton">Karton</SelectItem>
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
