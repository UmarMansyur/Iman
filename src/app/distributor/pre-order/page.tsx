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
} from "@/components/ui/table";
import { ShoppingCart, Trash } from "lucide-react";
import { useUserStore } from "@/store/user-store";
import toast from "react-hot-toast";
import { Textarea } from "@/components/ui/textarea";
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

  async function getProduct() {
    const response = await fetch(
      "/api/product?page=1&limit=10000&factory_id=" + user?.factory_selected?.id
    );
    const data = await response.json();
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

    const data = {
      product_id: product_id,
      desc: product.find((item: any) => item.id === product_id)?.name,
      jumlah: jumlah,
      harga: priceProductBall,
      total: totalPrice,
      diskon: diskon,
      total_harga: totalHarga,
      total_pack: amountPack,
      total_bal: amountBal,
    };
    setCart([...cart, data]);
    setProductId(null);
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
    setPriceProduct(selectedProduct?.price);
    setProductId(selectedProduct?.id);
    setTotalHarga(0);
    setTotalPrice(0);
    setPriceProductBall(selectedProduct?.price * 200);
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

    const packAmount = jumlah * 200;
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
    const formData = new FormData();
    formData.append("detail_invoices", JSON.stringify(cart));
    formData.append("proof_of_payment", file);
    formData.append("payment_method_id", paymentMethodId);
    formData.append("total", totalCart.toString());
    formData.append("down_payment", downPayment.toString());
    formData.append("factory_id", user!.factory_selected!.id);
    formData.append("user_id", user!.id);
    formData.append("payment_status", "Pending");
    formData.append("notes", notes);
    formData.append("remaining_balance", (totalCart - downPayment).toString());
    

    const response = await fetch("/api/pre-order", {
      method: "POST",
      body: formData,
    });

    const responseData = await response.json();
    if(response.ok) {
      toast.success("Transaksi berhasil disimpan");
      handleResetForm();
    } else {
      toast.error(responseData.message);
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
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <Label className="font-medium text-sm">Nama Produk</Label>
                <Select onValueChange={handleSelectProduct}>
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
                <Label className="font-medium text-sm">Jumlah Bal</Label>
                <Input
                  type="text"
                  placeholder="Masukkan jumlah bal"
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
                <Label className="font-medium text-sm">Harga Produk/Pack</Label>
                <Input
                  type="text"
                  placeholder="Masukkan harga produk"
                  value={
                    new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                    })
                      .format(priceProduct || 0)
                      .slice(0, -3) || ""
                  }
                  disabled
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="font-medium text-sm">Harga Produk/Bal</Label>
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
              <Button variant="outline" onClick={handleResetForm}>
                Reset
              </Button>
              <Button onClick={handleAddToCart}>
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
                  <TableHead className="text-end">Harga Produk/Bal</TableHead>
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
                      {item.jumlah}
                    </TableCell>
                    <TableCell className="text-end">
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                      })
                        .format(item.harga)
                        .slice(0, -3)}
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
              </TableBody>
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
                <Select onValueChange={handleSelectPaymentMethod}>
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
                <Label className="font-medium text-sm">
                  Upload Bukti Pembayaran
                </Label>
                <Input type="file" placeholder="Masukkan file pembayaran" accept="image/*" multiple={false} max={1} onChange={(e) => setFile(e.target.files?.[0] || null)} />
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
            <Button variant="outline" onClick={handleResetForm}>
              Reset
            </Button>
            <Button type="button" onClick={handleSubmitButton} size="lg">
              Simpan Transaksi
            </Button>
          </div>
        </CardContent>
      </Card>
    </MainPage>
  );
}
