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
import { Switch } from "@/components/ui/switch";
import { useUserStore } from "@/store/user-store";
import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { redirect } from "next/navigation";
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
import { Search, SearchCheckIcon } from "lucide-react";
import EmptyData from "@/components/views/empty-data";

export default function CreateTransaction() {
  const { user } = useUserStore();
  const [isProduct, setIsProduct] = useState(true);
  const [product, setProduct] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string | undefined>(
    undefined
  );
  const [stock, setStock] = useState<number>(0);
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

  const getProduct = async () => {
    const response = await fetch(
      `/api/distributor/data-stock?distributor_id=${user?.id}&factory_id=${user?.factory_selected?.id}`
    );
    const data = await response.json();
    if(data.data.length === 0) {
      toast.error("Tidak ada data produk yang tersedia, Silahkan order produk terlebih dahulu");
      redirect("/distributor/pre-order");
    }
    setProduct(data.data);
  };

  const handleSelectProduct = (value: string) => {
    setSelectedProduct(value);
    const availableStock = product.find(
      (item: any) => item.product.id == value
    );
    setStock(availableStock?.available_stock);
    // harga masih per pack
    setPrice(availableStock?.product.price);
  };

  const getExistingBuyers = async () => {
    const response = await fetch(
      `/api/distributor/buyer?distributor_id=${user?.id}&factory_id=${user?.factory_selected?.id}`
    );
    const data = await response.json();
    setExistingBuyers(data.data);
  };


    // Tambahkan state untuk paginasi
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5; // Jumlah item per halaman
  
    // Tambahkan fungsi untuk menghitung total halaman
    const totalPages = Math.ceil(filteredBuyer.length / itemsPerPage);
  
    // Fungsi untuk mendapatkan data yang ditampilkan di halaman saat ini
    const getCurrentPageData = () => {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      return filteredBuyer.slice(startIndex, endIndex);
    };

  const handleSearchBuyer = async () => {
    const filteredBuyer = existingBuyers.filter((buyer: any) =>
      buyer.name.toLowerCase().includes(searchBuyer.toLowerCase())
    );
    setFilteredBuyer(filteredBuyer);
  };

  const handleBuyerSelect = (buyer: any) => {
    setSelectedBuyer(buyer);
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
    const productData = product.find(
      (item: any) => item.product.id == selectedProduct
    );

    if (quantity <= 0 || price <= 0) {
      toast.error("Jumlah dan harga harus lebih dari 0");
      return;
    }

    // jika sudah ada di cart maka tambahkan quantitynya
    const existingItem = cart.find(
      (item) => item.product_id === selectedProduct
    );
    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.subtotal = existingItem.quantity * price;
    } else {
      setCart([
        ...cart,
        {
          product_id: isProduct ? selectedProduct : null,
          product_name: productData?.product.name,
          product_type: productData?.product.type,
          quantity: quantity,
          price: price,
          subtotal: subtotal,
        },
      ]);
    }
    setQuantity(0);
    setPrice(0);
    setSubtotal(0);
    setSelectedProduct(undefined);
  };

  // const handleSelectBuyer = (value: string) => {
  //   const existingBuyer = existingBuyers.find(
  //     (buyer: any) => buyer.id == value
  //   );
  //   // alamat lengkap
  //   const address = `${existingBuyer.address}, ${existingBuyer.city}, ${existingBuyer.province}`;
  //   setSelectedBuyer(existingBuyer.id);
  //   setBuyerForm({
  //     name: existingBuyer.name,
  //     address: address,
  //     phone: existingBuyer.phone,
  //     notes: "",
  //   });
  // };

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
        factory_id: user?.factory_selected?.id,
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
          is_product: isProduct,
          product_id: isProduct ? item.product_id : null,
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
      }

      toast.success("Transaksi berhasil disimpan");
      // Reset form setelah berhasil
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
      setIsProduct(true);
      setCart([]);
      setPaymentMethod("");
      setSelectedBuyer("");
      setSelectedProduct(undefined);
      setIsProduct(true);
      setCart([]);
      setDeliveryCost(0);
      redirect("/distributor/transaksi");
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
    setSubtotal(quantity * price);
  }, [quantity, price]);

  useEffect(() => {
    const total = cart.reduce((acc, item) => acc + item.subtotal, 0);
    setRemainingPayment(total + deliveryCost - downPayment);
  }, [cart, downPayment, deliveryCost]);

  return (
    <MainPage>
      <Card>
        <CardHeader>
          <CardTitle>Tambah Transaksi</CardTitle>
          <CardDescription>
            Tambah transaksi baru. Terdapat dua jenis transaksi yaitu transaksi
            produk dan transaksi non produk
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Form input transaksi toogle swith product dan non product */}
          <form>
            <div className="grid grid-cols-3 gap-4 mb-3">
              <div className="flex flex-col gap-2">
                <Label>Jenis Transaksi</Label>
                <div className="flex items-center gap-2">
                  <Switch checked={isProduct} onCheckedChange={setIsProduct} />
                  <p className="text-sm text-gray-500">
                    {isProduct ? "Transaksi Produk" : "Transaksi Non Produk"}
                  </p>
                </div>
              </div>
              <div
                className={`flex flex-col gap-2 ${
                  !isProduct ? "col-span-2" : ""
                }`}
              >
                <Label>{isProduct ? "Produk" : "Keterangan"}</Label>
                {isProduct ? (
                  <Select
                    value={selectedProduct}
                    onValueChange={handleSelectProduct}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Produk">
                        {selectedProduct
                          ? product.find(
                              (item: any) => item.product.id == selectedProduct
                            )?.product.name +
                            " - " +
                            product.find(
                              (item) => item.product.id == selectedProduct
                            )?.product.type
                          : "Pilih Produk"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {product.map((item: any) => (
                        <SelectItem
                          key={item.product.id}
                          value={item.product.id.toString()}
                        >
                          {item.product.name} - {item.product.type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    type="text"
                    placeholder="Masukkan keterangan transaksi"
                  />
                )}
              </div>
              {isProduct && (
                <div className="flex flex-col gap-2">
                  <Label>Stock(Ball)</Label>
                  <Input
                    type="text"
                    value={stock || 0}
                    onChange={(e) => setStock(Number(e.target.value))}
                  />
                </div>
              )}
            </div>
            <div className="grid grid-cols-3 gap-4">
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
                <Label>Harga</Label>
                <Input
                  type="text"
                  value={formatRibuan(price)}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\./g, "");
                    setPrice(Number(value));
                  }}
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
                Tambah ke Keranjang
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
                        Hapus
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
                      Keranjang masih kosong
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
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
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
          </div>
          <div className="flex flex-col gap-2 mt-4">
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
          <div className="flex flex-col gap-2 mt-4">
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
                              <TableCell>{buyer.name}</TableCell>
                              <TableCell>{buyer.address}</TableCell>
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
                          {filteredBuyer.length === 0 && (
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
