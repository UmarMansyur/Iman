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
import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUserStore } from "@/store/user-store";
import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { redirect, useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@/components/ui/table";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Search, SearchCheckIcon, ShoppingCart, Trash2 } from "lucide-react";
import EmptyData from "@/components/views/empty-data";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function CreateTransaction() {
  const { user } = useUserStore();
  const [product, setProduct] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string | undefined>(
    undefined
  );
  const [buyerType, setBuyerType] = useState<"new" | "existing">("new");
  const [existingBuyers, setExistingBuyers] = useState<any[]>([]);
  const [selectedBuyer, setSelectedBuyer] = useState<string>("");
  const [cart, setCart] = useState<any[]>([]);
  const [buyerForm, setBuyerForm] = useState({
    name: "",
    phone: "",
    address: "",
    notes: "",
  });
  const [quantity, setQuantity] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);
  const [subtotal, setSubtotal] = useState<number>(0);
  const [downPayment, setDownPayment] = useState<number>(0);
  const [remainingPayment, setRemainingPayment] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [paymentMethodList, setPaymentMethodList] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deliveryCost, setDeliveryCost] = useState<number>(0);
  const [open, setOpen] = useState(false);
  const [searchBuyer, setSearchBuyer] = useState<string>("");
  const [filteredBuyer, setFilteredBuyer] = useState<any[]>([]);
  const [purchaseUnit, setPurchaseUnit] = useState<
    "pack" | "slop" | "bal" | "karton"
  >("pack");

  const getProduct = async () => {
    const response = await fetch(
      `/api/distributor-product?user_id=${user?.id}`
    );
    const data = await response.json();

    if (!data.products) {
      toast.error("Terjadi kesalahan saat mengambil data produk");
      return;
    }

    if (data.products.length === 0) {
      toast.error(
        "Tidak ada data produk yang tersedia, Silahkan hubungi operator pabrik dan set harga di halaman data produk"
      );
      redirect("/distributor/data-produk");
    }
    setProduct(data.products);
  };

  const handleSelectProduct = (value: string) => {
    setSelectedProduct(value);

    // Ambil produk yang dipilih
    const selectedProductData = product.find((item: any) => item.id == value);
    // Set harga langsung dari data produk
    setPrice(selectedProductData?.price);
  };

  const getExistingBuyers = async () => {
    const response = await fetch(
      `/api/distributor/buyer?distributor_id=${user?.id}`
    );
    const data = await response.json();
    setExistingBuyers(data.data);
    setFilteredBuyer(data.data);
  };

  // Tambahkan state untuk paginasi
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Jumlah item per halaman

  // Tambahkan fungsi untuk menghitung total halaman
  const totalPages = Math.ceil((filteredBuyer?.length || 0) / itemsPerPage);

  // Fungsi untuk mendapatkan data yang ditampilkan di halaman saat ini
  const getCurrentPageData = () => {
    if (!filteredBuyer?.length) return [];

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredBuyer.slice(startIndex, endIndex);
  };

  const handleSearchBuyer = async () => {
    if (!existingBuyers) return;

    const filteredBuyer = existingBuyers.filter((buyer: any) =>
      buyer.name.toLowerCase().includes(searchBuyer.toLowerCase())
    );
    setFilteredBuyer(filteredBuyer);
  };

  const handleBuyerSelect = (buyer: any) => {
    setSelectedBuyer(buyer.id);
    setBuyerForm({
      name: buyer.name,
      address: buyer.address,
      phone: buyer.phone,
      notes: "",
    });
    setBuyerType("existing");
    setOpen(false);
  };

  const formatRibuan = (number: number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const getHandlePaymentMethod = async () => {
    const response = await fetch(`/api/payment?limit=1000&page=1`);
    const data = await response.json();
    setPaymentMethodList(data.payments);
  };

  const addToCart = () => {
    if (!selectedProduct) return;
    const productData = product.find((item: any) => item.id == selectedProduct);

    if (quantity <= 0 || price <= 0) {
      toast.error("Jumlah dan harga harus lebih dari 0");
      return;
    }

    // Konversi quantity berdasarkan unit yang dipilih
    let convertedQuantity = quantity;

    switch (purchaseUnit) {
      case "slop":
        convertedQuantity = quantity * (productData?.per_slop || 10); // 1 slop = 10 pack
        break;
      case "bal":
        convertedQuantity = quantity * (productData?.per_bal || 200); // 1 bal = 200 pack
        break;
      case "karton":
        convertedQuantity = quantity * (productData?.per_karton || 800); // 1 karton = 100 pack
        break;
      default:
        break;
    }

    // jika sudah ada di cart maka tambahkan quantitynya
    const existingItem = cart.find(
      (item) => item.product_id === selectedProduct
    );
    if (existingItem) {
      existingItem.quantity += convertedQuantity;
      existingItem.subtotal = existingItem.quantity * price;
    } else {
      setCart([
        ...cart,
        {
          product_id: selectedProduct,
          product_name: productData?.name + " - " + productData?.type,
          product_type: productData?.type,
          quantity: convertedQuantity,
          price: price,
          subtotal: convertedQuantity * price,
          purchase_unit: purchaseUnit,
        },
      ]);
    }
    setQuantity(0);
    setPrice(0);
    setSubtotal(0);
    setSelectedProduct(undefined);
  };

  const router = useRouter();
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // Validasi data
      if (cart.length === 0) {
        toast.error("Keranjang masih kosong");
        return;
      }

      if (!paymentMethod) {
        toast.error("Metode pembayaran harus dipilih");
        return;
      }

      if (buyerType === "new" && (!buyerForm.name || !buyerForm.address)) {
        toast.error("Nama dan alamat pembeli harus diisi");
        return;
      }

      if (buyerType === "existing" && !selectedBuyer) {
        toast.error("Pembeli harus dipilih");
        return;
      }

      // Menyiapkan payload sesuai dengan kebutuhan API
      const payload = {
        distributor_id: user?.id,
        payment_method_id: paymentMethod,
        buyer_name:
          buyerType === "new"
            ? buyerForm.name
            : existingBuyers.find((b) => b.id === selectedBuyer)?.name,
        buyer_address:
          buyerType === "new"
            ? buyerForm.address
            : existingBuyers.find((b) => b.id === selectedBuyer)?.address,
        is_new_buyer: buyerType === "new",
        ppn: 0,
        discount: 0,
        cost: 0,
        items: cart.map((item) => ({
          desc: item.product_name,
          amount: item.quantity,
          price: item.price,
          discount: 0,
          sale_price: item.price,
          is_product: true,
          product_id: item.product_id,
        })),
        down_payment: downPayment,
        remaining_balance: remainingPayment + deliveryCost,
        total_amount:
          cart.reduce((acc, item) => acc + item.subtotal, 0) + deliveryCost,
        cost_delivery: deliveryCost,
        desc_delivery: buyerForm.notes || "",
      };

      const response = await fetch("/api/distributor/transaksi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Terjadi kesalahan");
      } else {
        toast.success("Transaksi berhasil disimpan");
        setCart([]);
        setBuyerForm({
          name: "",
          phone: "",
          address: "",
          notes: "",
        });
        setDownPayment(0);
        setRemainingPayment(0);
        setPaymentMethod("");
        setSelectedBuyer("");
        setSelectedProduct(undefined);
        setCart([]);
        setDeliveryCost(0);
        window.open(
          "/distributor/transaksi/print-besar/" + data.invoice_code,
          "_blank"
        );
        router.push("/distributor/transaksi");
      }

      // Reset form setelah berhasil
    } catch (error: any) {
      toast.error(error.message || "Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (user?.id && user?.factory_selected?.id) {
      getProduct();
      getHandlePaymentMethod();
    }
  }, [user?.id, user?.factory_selected?.id]);

  useEffect(() => {
    if (user?.id) {
      getExistingBuyers();
    }
  }, [user?.id]);

  useEffect(() => {
    if (!selectedProduct) return;
    // jika purchase unit adalah pack maka harga per pack
    if (purchaseUnit === "pack") {
      setSubtotal(quantity * price);
    }
    // jika purchase unit adalah slop maka harga per slop
    if (purchaseUnit === "slop") {
      setSubtotal(quantity * price * (product.find((item: any) => item.id == selectedProduct)?.per_slop || 10));
    }
    // jika purchase unit adalah bal maka harga per bal
    if (purchaseUnit === "bal") {
      setSubtotal(quantity * price * (product.find((item: any) => item.id == selectedProduct)?.per_bal || 200));
    }
    // jika purchase unit adalah karton maka harga per karton
    if (purchaseUnit === "karton") {
      setSubtotal(quantity * price * (product.find((item: any) => item.id == selectedProduct)?.per_karton || 800));
    }
  }, [quantity, price, purchaseUnit, selectedProduct]);

  useEffect(() => {
    const total = cart.reduce((acc, item) => acc + item.subtotal, 0);
    setRemainingPayment(total + deliveryCost - downPayment);
  }, [cart, downPayment, deliveryCost]);

  return (
    <MainPage>
      <Card>
        <CardHeader>
          <CardTitle>Tambah Transaksi</CardTitle>
          <CardDescription>Tambah transaksi baru untuk produk</CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="grid grid-cols-4 gap-4">
              <div className="flex flex-col gap-2 mb-3">
                <Label>Produk</Label>
                <Select
                  value={selectedProduct}
                  onValueChange={handleSelectProduct}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Produk">
                      {selectedProduct
                        ? product.find(
                            (item: any) => item.id == selectedProduct
                          )?.name +
                          " - " +
                          product.find((item) => item.id == selectedProduct)
                            ?.type
                        : "Pilih Produk"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {product.map((item: any) => (
                      <SelectItem key={item.id} value={item.id.toString()}>
                        {item.name} - {item.type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Satuan Pembelian</Label>
                <Select
                  value={purchaseUnit}
                  onValueChange={(value: "pack" | "slop" | "bal" | "karton") =>
                    setPurchaseUnit(value)
                  }
                >
                  <SelectTrigger disabled={!selectedProduct}>
                    <SelectValue placeholder="Pilih Satuan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pack">Pack</SelectItem>
                    <SelectItem value="slop">
                      Slop (
                      {product.find((item: any) => item.id == selectedProduct)
                        ?.per_slop || 10}{" "}
                      Pack){" "}
                    </SelectItem>
                    <SelectItem value="bal">
                      Bal (
                      {product.find((item: any) => item.id == selectedProduct)
                        ?.per_bal || 200}{" "}
                      Pack)
                    </SelectItem>
                    <SelectItem value="karton">
                      Karton (
                      {product.find((item: any) => item.id == selectedProduct)
                        ?.per_karton || 800}{" "}
                      Pack)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Jumlah</Label>
                <Input
                  type="text"
                  value={formatRibuan(quantity)}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\./g, "");
                    setQuantity(Number(value));
                  }}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Harga Per Pack</Label>
                <Input type="text" value={formatRibuan(price)} disabled />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label>Harga Per {purchaseUnit}</Label>
                <Input
                  type="text"
                  value={
                    // jika purchase unit adalah pack maka harga per pack
                    purchaseUnit === "pack"
                      ? formatRibuan(price)
                      : // jika purchase unit adalah slop maka harga per slop
                        purchaseUnit === "slop"
                      ? formatRibuan(price * (product.find((item: any) => item.id == selectedProduct)?.per_slop || 10))
                      : // jika purchase unit adalah bal maka harga per bal
                        purchaseUnit === "bal"
                      ? formatRibuan(price * (product.find((item: any) => item.id == selectedProduct)?.per_bal || 200))
                      : // jika purchase unit adalah karton maka harga per karton
                        purchaseUnit === "karton"
                      ? formatRibuan(price * (product.find((item: any) => item.id == selectedProduct)?.per_karton || 800))
                      : ""
                  }
                  onChange={(e) => {
                    const value = e.target.value.replace(/\./g, "");
                    setPrice(Number(value));
                  }}
                  disabled
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Sub Total:</Label>
                <Input type="text" value={formatRibuan(subtotal)} disabled />
              </div>
            </div>
            <div className="flex w-full justify-between mt-3">
              <Button variant="outline" onClick={() => setCart([])}>
                Reset
              </Button>
              <Button type="button" onClick={addToCart}>
                <ShoppingCart className="w-4 h-4" /> Tambah ke Keranjang
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Keranjang</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto">
            {/* berikan alert bahwa jumlah akan dikonversi ke pack */}
            <Alert variant="default" className="mb-4">
              <AlertTitle>Perhatian</AlertTitle>
              <AlertDescription>Jumlah akan dikonversi ke pack oleh sistem secara otomatis jika satuan pembelian bukan pack!</AlertDescription>
            </Alert>
            <table className="w-full text-sm text-left rtl:text-right">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Produk - Tipe
                  </th>
                  <th scope="col" className="px-6 py-3 text-center">
                    Jumlah
                  </th>
                  <th scope="col" className="px-6 py-3 text-center">
                    Harga
                  </th>
                  <th scope="col" className="px-6 py-3 text-center">
                    Subtotal
                  </th>
                  <th scope="col" className="px-6 py-3 text-center">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item, index) => (
                  <tr
                    key={index}
                    className="bg-white border-b hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                      {item.product_name} - {item.product_type}
                    </td>
                    <td className="px-6 py-4 text-center">{item.quantity}</td>
                    <td className="px-6 py-4 text-center">
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                      }).format(item.price)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                      }).format(item.subtotal)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          const newCart = [...cart];
                          newCart.splice(index, 1);
                          setCart(newCart);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {cart.length === 0 && (
                  <tr className="bg-white border-b">
                    <td
                      colSpan={5}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      <EmptyData text="Keranjang masih kosong" />
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="font-semibold text-gray-900">
                  <td className="px-6 py-3 text-base">Total</td>
                  <td className="px-6 py-3 text-center">
                    {cart.reduce((acc, item) => acc + item.quantity, 0)}
                  </td>
                  <td className="px-6 py-3"></td>
                  <td className="px-6 py-3 text-center">
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                    }).format(
                      cart.reduce((acc, item) => acc + item.subtotal, 0)
                    )}
                  </td>
                  <td className="px-6 py-3"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pembayaran</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>Total Belanja</Label>
              <Input
                type="text"
                value={formatRibuan(
                  cart.reduce((acc, item) => acc + item.subtotal, 0)
                )}
                disabled
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Ongkos Kirim</Label>
              <Input
                type="text"
                value={formatRibuan(deliveryCost)}
                onChange={(e) => {
                  const value = e.target.value.replace(/\./g, "");
                  setDeliveryCost(Number(value));
                }}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Uang Muka</Label>
              <Input
                type="text"
                value={formatRibuan(downPayment)}
                onChange={(e) => {
                  const value = e.target.value.replace(/\./g, "");
                  setDownPayment(Number(value));
                }}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Jenis Pembayaran</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Jenis Pembayaran" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethodList.map((item: any) => (
                    <SelectItem key={item?.id} value={item?.id}>
                      {item?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Sisa Pembayaran</Label>
              <Input
                type="text"
                value={formatRibuan(remainingPayment)}
                disabled
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Total Keseluruhan</Label>
              <Input
                type="text"
                value={formatRibuan(
                  cart.reduce((acc, item) => acc + item.subtotal, 0) +
                    deliveryCost
                )}
                disabled
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Identitas Pembeli</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <Label>Nama Pembeli</Label>
                <div className="flex justify-between items-center gap-2">
                  <Input
                    placeholder="Masukkan nama pembeli"
                    value={buyerForm.name}
                    onChange={(e) =>
                      setBuyerForm({ ...buyerForm, name: e.target.value })
                    }
                  />
                  <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                      <div className="flex items-center border p-3 rounded-md cursor-pointer bg-blue-500 text-white">
                        <SearchCheckIcon className="w-4 h-4" />
                      </div>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Pilih Pembeli</DialogTitle>
                        <DialogDescription>
                          Pilih pembeli dari list pembeli
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex items-center gap-2 mt-3">
                        <Input
                          type="text"
                          placeholder="Cari Pembeli"
                          value={searchBuyer}
                          onChange={(e) => setSearchBuyer(e.target.value)}
                        />
                        <Button type="button" onClick={handleSearchBuyer}>
                          <Search className="w-4 h-4" />
                        </Button>
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nama</TableHead>
                            <TableHead>Alamat</TableHead>
                            <TableHead>Aksi</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {getCurrentPageData().map((buyer: any) => (
                            <TableRow key={buyer.id}>
                              <TableCell>{buyer?.name}</TableCell>
                              <TableCell>{buyer?.address}</TableCell>
                              <TableCell>
                                <Button
                                  size="sm"
                                  onClick={() => handleBuyerSelect(buyer)}
                                >
                                  Pilih
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                          {filteredBuyer?.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={3} className="text-center">
                                <EmptyData text="Tidak ada pembeli yang ditemukan" />
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>

                      {/* Tambahkan kontrol paginasi */}
                      <div className="flex items-center justify-end space-x-2 py-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                          }
                          disabled={currentPage === 1}
                        >
                          Sebelumnya
                        </Button>
                        <div className="text-sm">
                          Halaman {currentPage} dari {totalPages}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(prev + 1, totalPages)
                            )
                          }
                          disabled={currentPage === totalPages}
                        >
                          Selanjutnya
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Alamat Lengkap</Label>
                <Textarea
                  placeholder="Masukkan alamat lengkap (RT/RW, Kelurahan, Kecamatan, Kota/Kabupaten, Provinsi)"
                  value={buyerForm.address}
                  onChange={(e) =>
                    setBuyerForm({ ...buyerForm, address: e.target.value })
                  }
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Catatan Alamat (Opsional)</Label>
                <Textarea
                  placeholder="Tambahan informasi alamat pengiriman"
                  value={buyerForm.notes}
                  onChange={(e) =>
                    setBuyerForm({ ...buyerForm, notes: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-end mt-4 mb-8">
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Menyimpan..." : "Simpan Transaksi"}
        </Button>
      </div>
    </MainPage>
  );
}
