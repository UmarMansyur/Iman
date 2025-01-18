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
import { Switch } from "@/components/ui/switch";
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
import { Textarea } from "@/components/ui/textarea";
import { ShoppingCart, Trash } from "lucide-react";
import { useUserStore } from "@/store/user-store";
import toast from "react-hot-toast";
import { useParams, useRouter } from "next/navigation";
import LoaderScreen from "@/components/views/loader";

export default function CreateTransaction() {
  const router = useRouter();
  const [isDistributor, setIsDistributor] = useState("0");
  const [newAddress, setNewAddress] = useState(false);
  const [buyer, setBuyer] = useState([]);
  const [invoiceId, setInvoiceId] = useState<any>();
  const [location, setLocation] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState<any[]>([]);
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
  const [desc, setDesc] = useState("");
  const [distributor, setDistributor] = useState([]);
  const [distributorSelected, setDistributorSelected] = useState<any>();
  const [newBuyer, setNewBuyer] = useState(false);
  const [locationPrice, setLocationPrice] = useState<any>();
  const [buyerAddress, setBuyerAddress] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [harga, setHarga] = useState(0);
  const [downPayment, setDownPayment] = useState(0);
  const [buyerId, setBuyerId] = useState<any>();
  const [notes, setNotes] = useState<string>("");
  const [selectLocation, setSelectLocation] = useState<any>();
  const [stockPack, setStockPack] = useState<any>();
  const [stockBal, setStockBal] = useState<any>();
  const { user } = useUserStore();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [transaction, setTransaction] = useState<any>();

  async function getProduct() {
    const response = await fetch(
      "/api/product?page=1&limit=10000&factory_id=" + user?.factory_selected?.id
    );
    const data = await response.json();
    setProduct(data.products);
  }

  async function getBuyer() {
    const response = await fetch(
      "/api/buyer?factory_id=" + user?.factory_selected?.id
    );
    const data = await response.json();
    setBuyer(data);
  }

  async function getLocation() {
    const response = await fetch(
      "/api/location?factory_id=" + user?.factory_selected?.id
    );
    const data = await response.json();
    setLocation(data.data);
  }

  async function getPaymentMethod() {
    const response = await fetch("/api/payment");
    const data = await response.json();
    setPaymentMethod(data.payments);
  }

  async function getDistributor() {
    const response = await fetch(
      "/api/member-factory?factory_id=" +
        user?.factory_selected?.id +
        "&role_id=3"
    );
    const data = await response.json();
    setDistributor(data);
  }

  async function getData() {
    setIsLoading(true);
    try {
      await getDistributor();
      await Promise.all([
        getProduct(),
        getBuyer(),
        getLocation(),
        getPaymentMethod(),
        getTransaction(),
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    document.title = "Edit Transaksi - Indera Distribution";
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
    if (amountBal === 0) {
      toast.error("Stok produk bal tidak mencukupi");
      return;
    }

    if (!product_id) {
      toast.error("Pilih produk terlebih dahulu");
      return;
    }

    if (jumlah === 0) {
      toast.error("Anda belum memasukkan jumlah pada produk yang telah dipilih!");
      return;
    }

    if (jumlah > amountBal) {
      toast.error("Jumlah tidak boleh melebihi stok produk!");
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
      is_product: true,
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

    const stockNumber = selectedProduct?.stock;
    const bal = Math.floor(stockNumber / 200);
    const pack = stockNumber;

    setPriceProduct(selectedProduct?.price);
    setProductId(selectedProduct?.id);
    setStockPack(pack);
    setStockBal(bal);
    setTotalHarga(0);
    setTotalPrice(0);
    setPriceProductBall(selectedProduct?.price * (selectedProduct?.per_bal || 200));
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

    const maxBal = parseInt(String(stockBal).replace(/\D/g, ""));

    if (jumlah > maxBal) {
      setJumlah(maxBal);
      const packAmount = maxBal * (product.find((item: any) => item.id === product_id)?.per_bal || 200);
      const subTotal = packAmount * priceProduct;
      const potongan = (subTotal * diskon) / 100;

      setAmountPack(packAmount);
      setAmountBal(maxBal);
      setTotalHarga(subTotal - potongan);
      setTotalPrice(subTotal);
      return;
    }

    const packAmount = jumlah * (product.find((item: any) => item.id === product_id)?.per_bal || 200);
    const subTotal = packAmount * priceProduct;
    const potongan = (subTotal * diskon) / 100;

    setJumlah(jumlah);
    setAmountPack(packAmount);
    setAmountBal(jumlah);
    setTotalHarga(subTotal - potongan);
    setTotalPrice(subTotal);
  };

  const handleChangeDiskon = (e: any) => {
    const diskon = parseInt(e.target.value);
    if (isNaN(diskon)) {
      setDiskon(0);
      setTotalHarga(totalPrice);
      return;
    }

    if (diskon >= 100) {
      setDiskon(100);
    } else if (diskon <= 0) {
      setDiskon(0);
    } else {
      setDiskon(diskon);
    }

    const subTotal = totalPrice - (totalPrice * diskon) / 100;
    if (subTotal < 0) {
      setTotalHarga(0);
    } else {
      setTotalHarga(subTotal);
    }
  };

  const handleChangeLocation = (value: any) => {
    const locationSelected: any = location.find(
      (item: any) => item.id === value
    );
    setSelectLocation(locationSelected?.id);
    setLocationPrice(locationSelected?.cost || 0);
    setTotalCart(totalCart);
  };

  const handleResetForm = () => {
    setJumlah(0);
    setAmountPack(0);
    setDiskon(0);
    setTotalHarga(0);
    setTotalPrice(0);
    setProductId(null);
    setPriceProduct(0);
    setPriceProductBall(0);
  };

  const handleChangeLocationPrice = (e: any) => {
    const value = e.target.value;

    const numericValue = value.replace(/[^0-9]/g, "");

    if (numericValue === "") {
      setLocationPrice(0);
      setTotalCart(cart.reduce((acc, item) => acc + item.total_harga, 0));
    } else {
      const price = parseInt(numericValue);
      setLocationPrice(price);
    }
  };

  const handleDownPaymentChange = (e: any) => {
    const value = e.target.value;
    const numericValue = value.replace(/[^0-9]/g, "");

    if (numericValue === "") {
      setDownPayment(0);
    } else {
      setDownPayment(parseInt(numericValue));
    }
  };

  const finalTotal = totalCart + (locationPrice || 0) - (downPayment || 0);

  const handleRemoveFromCart = (index: number) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
  };

  const handleSubmitButton = async () => {
    console.log(distributorSelected);
    const data = {
      detail_invoices: cart,
      total: finalTotal,
      down_payment: downPayment,
      location_price: locationPrice,
      is_distributor: isDistributor === "2" ? true : false,
      type_preoder: false,
      new_pembeli: newBuyer ? newBuyer : null,
      buyer_name: newBuyer ? buyerName : null,
      buyer_address: newBuyer ? buyerAddress : null,
      distributor_id: distributorSelected,
      factory_id: user?.factory_selected?.id,
      user_id: user?.id,
      buyer_id: newBuyer ? null : buyerId,
      new_address: newAddress ? newAddress : null,
      payment_method_id: paymentMethodId,
      sub_total: totalCart,
      payment_status: "Paid",
      location_selected: selectLocation,
      notes: notes,
    };

    try {
      const response = await fetch(`/api/transaction/${invoiceId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message || "Berhasil mengupdate transaksi");
        setCart([]);
        setTotalCart(0);
        setDownPayment(0);
        setNotes("");
        setBuyerName("");
        setBuyerAddress("");
        setBuyerId(null);
        setDistributorSelected(null);
        setPaymentMethodId(null);
        setSelectLocation(null);
        setNewBuyer(false);
        setNewAddress(false);
        setAmountBal(0);
        setAmountPack(0);
        setTotalHarga(0);
        setTotalPrice(0);
        setPriceProduct(0);
        setProductId(null);
        setJumlah(0);
        setDiskon(0);
        setDesc("");
        setLocationPrice(0);
        setTotalCart(0);
        router.push("/operator/transaksi");
        return;
      }

      throw new Error(result.message || "Gagal mengupdate transaksi");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  async function getTransaction() {
    try {
      const response = await fetch(`/api/transaction/${id}`);
      const result = await response.json();
      const data = result.data;
      setInvoiceId(data.id);
      setTransaction(data);
      if (response.ok) {
        setCart(
          data.detailInvoices.map((item: any) => ({
            product_id: item.product_id,
            desc: item.desc,
            jumlah: item.amount,
            harga: item.price,
            total: item.sub_total,
            diskon: item.discount,
            total_harga: item.sub_total,
            total_pack: item.amount * (product.find((item: any) => item.id === item.product_id)?.per_bal || 200),
            total_bal: item.amount,
            is_product: item.is_product,
          }))
        );

        // Set other transaction details
        setDownPayment(data.down_payment || 0);
        setLocationPrice(data.deliveryTracking?.[0]?.cost || 0);
        setIsDistributor(data.is_distributor ? "2" : "1");
        if (!data.is_distributor) {
          setBuyerId(data.buyer_id);
        }
        setNewBuyer(false);
        setNewAddress(false);
        setBuyerName(data.buyer_name || "");
        setBuyerAddress(data.buyer_address || "");
        setNotes(data.notes || "");
        setPaymentMethodId(data.payment_method_id);
        setSelectLocation(data.deliveryTracking?.[0]?.location_id);
        setNotes(data.notes || "");

        // Set buyer information
        if (data.buyer) {
          setBuyerAddress(data.buyer.address || "");
          setBuyerName(data.buyer.name || "");
        }

        // Calculate total cart amount
        const totalCartAmount = data.sub_total || 0;
        setTotalCart(totalCartAmount);
      } else {
        throw new Error(data.message || "Failed to fetch transaction");
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  }

  useEffect(() => {
    if (distributor.length > 0 && transaction?.buyer) {
      const selectedDistributor: any = distributor.find(
        (item: any) => item.name == transaction?.buyer?.name
      );
      if (selectedDistributor) {
        setDistributorSelected(selectedDistributor.id);
      }
    }
  }, [distributor, transaction]);

  if (isLoading) {
    return (
      <MainPage>
        <div className="flex items-center justify-center h-screen">
          <div>
            <LoaderScreen />
          </div>
        </div>
      </MainPage>
    );
  }

  const handleChangeDistributor = (e: any) => {
    const selectedDistributor: any = distributor.find(
      (item: any) => item.id === e
    );
    if (selectedDistributor) {
      setDistributorSelected(e);
      setBuyerAddress(selectedDistributor.address);
    }
  };

  return (
    <MainPage>
      <Card className="w-full mx-auto">
        <CardHeader>
          <CardTitle>Edit Transaksi</CardTitle>
          <CardDescription>Edit data transaksi</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-6">
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
                <Label className="font-medium text-sm">
                  Stok Produk(Pack)
                </Label>
                <Input
                  type="text"
                  placeholder="Masukkan jumlah stok (Pack)"
                  value={
                    stockPack
                      ? new Intl.NumberFormat("id-ID").format(stockPack)
                      : "0"
                  }
                  onChange={(e) => setStockPack(e.target.value)}
                  disabled
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="font-medium text-sm">
                  Stok Produk(Bal)
                </Label>
                <Input
                  type="text"
                  placeholder="Masukkan jumlah stok (Bal)"
                  value={
                    stockBal
                      ? new Intl.NumberFormat("id-ID").format(stockBal)
                      : "0"
                  }
                  onChange={(e) => setStockBal(e.target.value)}
                  disabled
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="font-medium text-sm">Jumlah Bal</Label>
                <Input
                  type="text"
                  placeholder="Masukkan jumlah bal"
                  value={
                    jumlah
                      ? new Intl.NumberFormat("id-ID").format(jumlah)
                      : ""
                  }
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    handleChangeJumlah({ target: { value } });
                  }}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="font-medium text-sm">Jumlah Pack</Label>
                <Input
                  type="text"
                  placeholder="Masukkan jumlah pack"
                  value={
                    amountPack
                      ? new Intl.NumberFormat("id-ID").format(amountPack)
                      : ""
                  }
                  disabled
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="font-medium text-sm">
                  Harga Produk/Pack
                </Label>
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
                <Label className="font-medium text-sm">
                  Harga Produk/Bal
                </Label>
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
              <div className="flex flex-col gap-2">
                <Label className="font-medium text-sm">Diskon</Label>
                <Input
                  type="number"
                  placeholder="Jumlah Diskon"
                  value={diskon || ""}
                  max={100}
                  min={0}
                  onChange={(e) => handleChangeDiskon(e)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="font-medium text-sm">
                  Total Harga (Bal)
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

          {/* Cart Table */}
          <div className=" rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted">
                  <TableHead className="text-center w-16">No</TableHead>
                  <TableHead>Nama Produk</TableHead>
                  <TableHead className="text-center">Jumlah</TableHead>
                  <TableHead className="text-end">Harga Produk/Bal</TableHead>
                  <TableHead className="text-end">Diskon</TableHead>
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
                        .format(item.diskon)
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
                <span>Biaya Pengiriman</span>
                <span>
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                  })
                    .format(locationPrice || 0)
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
              <div className="flex justify-between items-center text-xl font-bold pt-2 border-t">
                <span>Total</span>
                <span>
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                  })
                    .format(finalTotal)
                    .slice(0, -3)}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="space-y-6 -t pt-6">
            <h3 className="text-lg font-semibold">Informasi Pembeli</h3>
            <div className="grid grid-cols-3 gap-6">
              <div className="flex flex-col gap-2">
                <Label className="font-medium text-sm">Tipe Pembeli</Label>
                <Input 
                  value={isDistributor === "2" ? "Distributor" : "Pembeli Biasa"} 
                  disabled
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="font-medium text-sm">Nama Pembeli</Label>
                <Input
                  value={buyerName}
                  disabled
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="font-medium text-sm">Metode Pembayaran</Label>
                <Input
                  value={paymentMethod.find((p: any) => p.id === paymentMethodId)?.name || ''}
                  disabled
                />
              </div>
              <div className="flex flex-col gap-2 col-span-3">
                <Label className="font-medium text-sm">Uang Muka</Label>
                <Input
                  value={new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                  })
                    .format(downPayment || 0)
                    .slice(0, -3)}
                  disabled
                />
              </div>
              <div className="flex flex-col gap-2 col-span-3">
                <Label className="font-medium text-sm">Alamat</Label>
                <Textarea
                  value={buyerAddress}
                  disabled
                />
              </div>
              <div className="flex flex-col gap-2 col-span-3">
                <Label className="font-medium text-sm">Catatan</Label>
                <Textarea
                  value={notes}
                  onChange={(e: any) => setNotes(e.target.value)}
                  disabled
                />
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          {isDistributor == "1" && (
            <div className="space-y-6 -t pt-6">
              <h3 className="text-lg font-semibold">Informasi Pengiriman</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  {newAddress ? (
                    <div>
                      <Label className="text-sm font-medium mb-2">
                        Alamat Pengiriman
                      </Label>
                      <Input placeholder="Masukkan alamat pengiriman baru" />
                    </div>
                  ) : (
                    <div>
                      <Label className="text-sm font-medium mb-2">
                        Alamat Pengiriman
                      </Label>
                      <Select
                        onValueChange={(value: any) =>
                          handleChangeLocation(value)
                        }
                        defaultValue={selectLocation}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Alamat" />
                        </SelectTrigger>
                        <SelectContent>
                          {location.map((item: any) => (
                            <SelectItem value={item.id} key={item.id}>
                              {item.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="font-medium text-sm">
                    Biaya Pengiriman
                  </Label>
                  <Input
                    placeholder="Masukkan biaya pengiriman"
                    value={
                      locationPrice === 0
                        ? ""
                        : new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                          })
                            .format(locationPrice)
                            .slice(0, -3)
                    }
                    onChange={handleChangeLocationPrice}
                    disabled={!newAddress}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex item-center gap-2">
                    <Switch
                      checked={newAddress}
                      onCheckedChange={setNewAddress}
                    />
                    <Label className="font-medium text-sm">
                      {newAddress ? "Alamat Baru" : "Alamat Pilihan"}
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <Button
              type="button"
              onClick={handleSubmitButton}
              size="lg"
              disabled={cart.length === 0 || !paymentMethodId}
            >
              Simpan Transaksi
            </Button>
          </div>
        </CardContent>
      </Card>
    </MainPage>
  );
}
