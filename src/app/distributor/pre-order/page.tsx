/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import MainPage from "@/components/main";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@radix-ui/react-dropdown-menu";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  TableFooter,
} from "@/components/ui/table";
import {
  ShoppingCart,
  Trash,
  Loader2,
  Save,
  RefreshCcw,
  Info,
} from "lucide-react";
import { useUserStore } from "@/store/user-store";
import toast from "react-hot-toast";
import { Textarea } from "@/components/ui/textarea";
import { redirect } from "next/navigation";
import EmptyData from "@/components/views/empty-data";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
export default function CreateTransaction() {
  const [paymentMethod, setPaymentMethod] = useState([]);
  const [paymentMethodId, setPaymentMethodId] = useState<any>();
  const [product, setProduct] = useState<any[]>([]);
  const [priceProduct, setPriceProduct] = useState<any>();
  const [product_id, setProductId] = useState<any>();
  const [amountBal, setAmountBal] = useState<any>();
  const [amountPack, setAmountPack] = useState<any>();
  const [jumlah, setJumlah] = useState(0);
  const [diskon, setDiskon] = useState(0);
  const [totalHarga, setTotalHarga] = useState(0);
  const [priceProductBall, setPriceProductBall] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalCart, setTotalCart] = useState(0);
  const [cart, setCart] = useState<any[]>([]);
  const [downPayment, setDownPayment] = useState(0);
  const [notes, setNotes] = useState<string>("");
  const [file, setFile] = useState<any>();
  const { user } = useUserStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [factorySelected, setFactorySelected] = useState<any>();
  const [isAlert, setIsAlert] = useState(false);
  const [packagingType, setPackagingType] = useState<'ball' | 'karton'>('ball');

  async function getProduct() {
    const response = await fetch("/api/product?page=1&limit=10000");
    const data = await response.json();
    // jika tidak ada data produk tampilkan pesan error menggunakan toast
    if (data.products.length === 0) {
      toast.error(
        "Tidak ada data produk, Silahkan hubungi operator pabrik terlebih dahulu!"
      );
    }
    setProduct(data.products);
  }

  async function getPaymentMethod() {
    const response = await fetch("/api/payment");
    const data = await response.json();
    setPaymentMethod(data.payments);
  }

  async function getData() {
    await getProduct();
    await getPaymentMethod();
  }

  useEffect(() => {
    if (user?.factory_selected) {
      getData();
    }
  }, [user?.factory_selected]);

  useEffect(() => {
    setTotalCart(calculateTotalCart(cart));
  }, [cart]);

  const calculateTotalCart = (cartItems: any[]) => {
    return cartItems.reduce((acc, item) => acc + item.total_harga, 0);
  };

  const handleAddToCart = () => {
    if (!product_id) {
      toast.error("Pilih produk terlebih dahulu");
      return;
    }

    if (jumlah === 0) {
      toast.error(
        "Anda belum memasukkan jumlah pada produk yang telah dipilih!"
      );
      return;
    }

    const existProduct = cart.find(
      (item: any) => item.product_id === product_id
    );
    if (existProduct) {
      toast.error("Produk sudah ada di keranjang");
      return;
    }

    const data = {
      product_id: product_id,
      desc:
        product.find((item: any) => item.id === product_id)?.name +
        " - " +
        product.find((item: any) => item.id === product_id)?.type,
      jumlah: jumlah * (packagingType === 'ball' ? (product.find((item: any) => item.id === product_id)?.per_bal || 200) : (product.find((item: any) => item.id === product_id)?.per_karton || 800)),
      harga: priceProduct,
      total: totalPrice,
      diskon: diskon,
      total_harga: totalHarga,
      total_pack: amountPack,
      total_bal: amountBal,
    };
    // tampilkan data product yang sudah di filter
    setProduct(
      product.filter((product: any) => product.factory_id == factorySelected)
    );
    if (!isAlert) {
      const isFactory = product.find((item: any) => item.id === product_id)?.factory?.name ? product.find((item: any) => item.id === product_id)?.factory?.name : "Non Pabrik";
      toast.success(
        "Anda telah memilih produk dari pabrik " +
        isFactory +
        ". Sistem akan memfilter produk dari pabrik yang sama!",
        {
          duration: 10000,
        }
      );
      setIsAlert(true);
    }
    setCart([...cart, data]);
    setProductId(undefined);
    setPriceProduct(0);
    setPriceProductBall(0);
    setJumlah(0);
    setDiskon(0);
    setTotalHarga(0);
    setTotalPrice(0);
    setAmountPack(0);
    setAmountBal(0);
  };

  const handleSelectProduct = (item: any) => {
    const selectedProduct: any = product.find(
      (product: any) => product.id == item
    );
    setFactorySelected(selectedProduct?.factory_id);
    setPriceProduct(selectedProduct?.price);
    setProductId(selectedProduct?.id);
    setTotalHarga(0);
    setTotalPrice(0);
    // Force ball packaging if factory_id exists
    if (selectedProduct?.factory_id) {
      setPackagingType('ball');
      setPriceProductBall(selectedProduct?.price * (selectedProduct?.per_bal || 200));
    } else {
      setPackagingType('karton');
      setPriceProductBall(selectedProduct?.price * (selectedProduct?.per_karton || 800));
    }
  };

  const handleChangeJumlah = (e: any) => {
    const value = e.target.value;
    if (isNaN(value) || value === "") {
      setJumlah(0);
      setAmountPack(0);
      setAmountBal(0);
      setTotalHarga(0);
      setTotalPrice(0);
      return;
    }

    const jumlah = parseInt(value);
    if (jumlah < 0) {
      setJumlah(0);
      setAmountPack(0);
      setAmountBal(0);
      setTotalHarga(0);
      setTotalPrice(0);
      return;
    }

    const packAmount = jumlah * (packagingType === 'ball' ? (product.find((item: any) => item.id === product_id)?.per_bal || 200) : (product.find((item: any) => item.id === product_id)?.per_karton || 800));
    const subTotal = packAmount * priceProduct;

    setAmountPack(packAmount);
    setAmountBal(jumlah);
    setTotalHarga(subTotal);
    setTotalPrice(subTotal);
    setJumlah(jumlah);
    return;
  };
  const handleRemoveFromCart = (index: number) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
  };

  const handleSubmitButton = async () => {
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("detail_invoices", JSON.stringify(cart));
      if (file) {
        formData.append("proof_of_payment", file);
      }
      formData.append("payment_method_id", paymentMethodId);
      formData.append("total", totalCart.toString());
      formData.append("down_payment", downPayment.toString());
      if (factorySelected) {
        formData.append("factory_id", factorySelected);
      }
      formData.append("user_id", user!.id);
      formData.append("payment_status", "Unpaid");
      formData.append("notes", notes);
      formData.append(
        "remaining_balance",
        (totalCart - downPayment).toString()
      );

      const response = await fetch("/api/pre-order", {
        method: "POST",
        body: formData,
      });

      const responseData = await response.json();
      if (response.ok) {
        toast.success("Transaksi berhasil disimpan");
        handleResetForm();
      } else {
        toast.error(responseData.message);
      }
      redirect("/distributor/data-order");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectPaymentMethod = (value: any) => {
    setPaymentMethodId(value);
  };

  const handleResetForm = () => {
    setCart([]);
    setTotalCart(0);
    setDownPayment(0);
    setNotes("");
  };

  return (
    <MainPage>
      <Card className="w-full mx-auto">
        <CardHeader>
          <CardTitle>Pre Order</CardTitle>
          <CardDescription>
            Setelah anda memasukkan data produk yang ingin dibeli, maka anda
            dapat melakukan pembayaran uang muka dan upload bukti pembayaran.
            Mohon menunggu konfirmasi dari admin kami untuk melakukan
            pengiriman.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="bg-blue-500 rounded-md">
            <p className="text-sm p-3 text-white">
              Setiap pembelian produk dari pabrik jenis kemasan akan dikonversi ke ball, namun jika pabrik tidak terintegerasi dengan sistem maka akan secara otomatis dikonversi ke karton.
            </p>
          </div>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <Label className="font-medium text-sm">Jenis Kemasan</Label>
                {/* kapital huruf pertama */}
                <input type="text" value={packagingType.charAt(0).toUpperCase() + packagingType.slice(1)} disabled className="bg-muted p-2.5 rounded-md" />
              </div>

              <div className="flex flex-col gap-2">
                <Label className="font-medium text-sm">Nama Produk</Label>
                <Select
                  onValueChange={handleSelectProduct}
                  value={product_id}
                  disabled={product.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Produk" />
                  </SelectTrigger>
                  <SelectContent>
                    {product.map((item: any) => (
                      <SelectItem value={item.id} key={item.id}>
                        {item.name} - {item.type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="font-medium text-sm">Jumlah</Label>
                <Input
                  type="text"
                  placeholder="Masukkan jumlah bal"
                  disabled={product.length === 0}
                  value={
                    jumlah ? new Intl.NumberFormat("id-ID").format(jumlah) : ""
                  }
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    handleChangeJumlah({ target: { value } });
                  }}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="font-medium text-sm">Harga Produk</Label>
                <Input
                  type="text"
                  placeholder="0"
                  disabled
                  value={
                    new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                    })
                      .format(priceProductBall || 0)
                      .slice(0, -3) || 0
                  }
                />
              </div>
              <div className="flex col-span-2 flex-col gap-2">
                <Label className="font-medium text-sm">
                  Sub Total Harga (Bal)
                </Label>
                <Input
                  type="text"
                  placeholder="Total Harga"
                  value={
                    new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                    })
                      .format(totalHarga || 0)
                      .slice(0, -3) || 0
                  }
                  className="bg-muted"
                  disabled
                />
              </div>
            </div>
            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handleResetForm}
                disabled={isSubmitting || cart.length === 0}
              >
                <RefreshCcw className="w-4 h-4 mr-1" />
                Reset
              </Button>
              <Button
                type="button"
                onClick={handleAddToCart}
                disabled={!product_id}
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Tambah Keranjang</span>
              </Button>
            </div>
          </div>

          <div className=" rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted">
                  <TableHead className="text-center w-16">No</TableHead>
                  <TableHead>Nama Produk</TableHead>
                  <TableHead className="text-center">Jumlah</TableHead>
                  <TableHead className="text-end">Harga Produk</TableHead>
                  <TableHead className="text-end">Total</TableHead>
                  <TableHead className="text-center w-20">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cart.map((item: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell className=" text-center">{index + 1}</TableCell>
                    <TableCell className="">{item.desc}</TableCell>
                    <TableCell className=" text-center">
                      {
                        product.find((i: any) => i.id == item.product_id)?.factory_id ? new Intl.NumberFormat("id-ID").format(item.jumlah / (product.find((i: any) => i.id == item.product_id)?.per_bal || 200)) : new Intl.NumberFormat("id-ID").format(item.jumlah / (product.find((i: any) => i.id == item.product_id)?.per_karton || 800)) + " " + (packagingType === 'ball' ? 'Bal' : 'Karton')
                      }
                    </TableCell>
                    <TableCell className="text-end">
                      {/* jika factory_id tidak null maka kalikan dengan per_bal tapi jika null kalikan dengan per_karton */}
                      {
                        product.find((i: any) => i.id == item.product_id)?.factory_id ? new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                        })
                          .format(item.harga * (product.find((i: any) => i.id == item.product_id)?.per_bal || 200))
                          .slice(0, -3) : new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                          })
                            .format(item.harga * (product.find((i: any) => i.id == item.product_id)?.per_karton || 800))
                            .slice(0, -3)
                      }
                    </TableCell>
                    <TableCell className="text-end">
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                      })
                        .format(item.total_harga)
                        .slice(0, -3)}
                    </TableCell>
                    <TableCell className=" text-center">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveFromCart(index)}
                      >
                        <Trash></Trash>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {cart.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      <EmptyData text="Keranjang Belanjaan Kosong" />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              <TableFooter>
                <TableRow className="bg-muted">
                  <TableHead colSpan={2} className="text-center">
                    Total
                  </TableHead>
                  <TableHead className="text-center">
                    {cart.reduce((acc, item) => acc + item.jumlah / (packagingType === 'ball' ? (product.find((i: any) => i.id == item.product_id)?.per_bal || 200) : (product.find((i: any) => i.id == item.product_id)?.per_karton || 800)), 0)} {" "}
                    {packagingType === 'ball' ? 'Bal' : 'Karton'}
                  </TableHead>
                  <TableHead></TableHead>
                  <TableHead className="text-end">
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                    })
                      .format(totalCart)
                      .slice(0, -3)}
                  </TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableFooter>
            </Table>
          </div>

          {/* Total Amount */}
          <div className="bg-primary text-primary-foreground p-6 rounded-lg">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>Total Belanja</span>
                <span>
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                  })
                    .format(totalCart)
                    .slice(0, -3)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Uang Muka</span>
                <span>
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                  })
                    .format(downPayment || 0)
                    .slice(0, -3)}
                </span>
              </div>
              <div className="flex flex-col text-xl font-bold pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span>Total</span>
                  <span>
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                    })
                      .format(totalCart - downPayment)
                      .slice(0, -3)}
                  </span>
                </div>
                {totalCart - downPayment < 0 && (
                  <div className="flex justify-between items-center text-lg mt-2">
                    <span>Kembalian</span>
                    <span>
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                      })
                        .format(Math.abs(totalCart - downPayment))
                        .slice(0, -3)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-10">
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <Label className="font-medium text-sm">Jenis Pembayaran</Label>
                <Select
                  onValueChange={handleSelectPaymentMethod}
                  disabled={
                    paymentMethod.length === 0 ||
                    isSubmitting ||
                    cart.length === 0
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Pembayaran" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethod.map((item: any) => (
                      <SelectItem value={item.id} key={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <Label className="font-medium text-sm">
                  Jumlah Pembayaran Uang Muka
                </Label>
                <Input
                  type="text"
                  placeholder="Masukkan jumlah pembayaran uang muka"
                  disabled={
                    isSubmitting ||
                    cart.length === 0 ||
                    paymentMethodId === undefined
                  }
                  value={
                    new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                    })
                      .format(downPayment || 0)
                      .slice(0, -3) || 0
                  }
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    setDownPayment(parseInt(value));
                  }}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Label className="font-medium text-sm">
                    Upload Bukti Pembayaran
                  </Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-3 h-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>Maksimal 1 MB</TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  type="file"
                  placeholder="Masukkan file pembayaran"
                  accept="image/*"
                  multiple={false}
                  max={1}
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  disabled={
                    isSubmitting ||
                    cart.length === 0 ||
                    paymentMethodId === undefined
                  }
                />
                {/* beri informasi maksimal 1 mb dengan tooltip */}
              </div>
            </div>
            <div className="space-y-4 col-span-3">
              <Label className="font-medium text-sm">Catatan</Label>
              <div>
                <Textarea
                  className="w-full"
                  placeholder="Masukkan catatan"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handleResetForm}
              disabled={isSubmitting || cart.length === 0}
            >
              <RefreshCcw className="w-4 h-4 mr-1" />
              Reset
            </Button>
            <Button
              type="button"
              onClick={handleSubmitButton}
              size="lg"
              disabled={isSubmitting || cart.length === 0}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-1" />
                  Simpan Transaksi
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </MainPage>
  );
}
