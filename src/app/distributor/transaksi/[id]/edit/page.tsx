/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import MainPage from "@/components/main";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { useUserStore } from "@/store/user-store";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

export default function EditTransaction() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUserStore();
  const [isLoading, setIsLoading] = useState(true);
  const [transaction, setTransaction] = useState<any>(null);
  const [paymentMethodList, setPaymentMethodList] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [downPayment, setDownPayment] = useState<number>(0);
  const [deliveryCost, setDeliveryCost] = useState<number>(0);
  const [deliveryNotes, setDeliveryNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [buyerType, setBuyerType] = useState<"new" | "existing">("existing");
  const [isProduct, setIsProduct] = useState(true);
  const [product, setProduct] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string | undefined>(undefined);
  const [stock, setStock] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);
  const [subtotal, setSubtotal] = useState<number>(0);

  // Format angka ke format ribuan
  const formatRibuan = (number: number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Ambil data transaksi
  const getTransaction = async () => {
    try {
      const response = await fetch(`/api/distributor/transaksi/${params.id}`);
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message);
      
      setTransaction(data);
      setPaymentMethod(data.payment_method_id.toString());
      setDownPayment(data.down_payment);
      setDeliveryCost(data.cost_delivery);
      setDeliveryNotes(data.desc_delivery);
    } catch (error: any) {
      toast.error(error.message || "Gagal mengambil data transaksi");
    } finally {
      setIsLoading(false);
    }
  };

  // Ambil daftar metode pembayaran
  const getPaymentMethods = async () => {
    try {
      const response = await fetch(`/api/payment?limit=1000&page=1`);
      const data = await response.json();
      setPaymentMethodList(data.payments);
    } catch (error: any) {
      toast.error(error.message || "Gagal mengambil data metode pembayaran");
    }
  };

  // Handle submit form
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // Validasi data
      if (transaction.DetailTransactionDistributor.length === 0) {
        toast.error("Keranjang masih kosong");
        return;
      }

      if (!paymentMethod) {
        toast.error("Metode pembayaran harus dipilih");
        return;
      }

      const payload = {
        payment_method_id: paymentMethod,
        down_payment: downPayment,
        distributor_id: user?.id,
        factory_id: user?.factory_selected?.id,
        cost_delivery: deliveryCost,
        desc_delivery: deliveryNotes,
        remaining_balance: (transaction.amount - downPayment) + deliveryCost,
        buyer_name: transaction.buyer.name,
        buyer_address: transaction.buyer.address,
        is_new_buyer: false,
        items: transaction.DetailTransactionDistributor.map((item: any) => ({
          desc: item.desc,
          amount: item.amount,
          price: item.price,
          discount: 0,
          sale_price: item.sale_price,
          is_product: true,
          product_id: item.is_product ? item.product_id : null,
        })),
        total_amount: transaction.amount + deliveryCost,
        ppn: 0,
        discount: 0,
        cost: 0
      };

      const response = await fetch(`/api/distributor/transaksi/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message);

      toast.success("Berhasil mengupdate transaksi");
    } catch (error: any) {
      toast.error(error.message || "Gagal mengupdate transaksi");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      getTransaction();
      getPaymentMethods();
    }
  }, [params.id]);

  // Tambahkan fungsi untuk mengambil data produk
  const getProduct = async () => {
    try {
      const response = await fetch(
        `/api/distributor/data-stock?distributor_id=${user?.id}&factory_id=${user?.factory_selected?.id}`
      );
      const data = await response.json();
      setProduct(data.data);
    } catch (error: any) {
      toast.error(error.message || "Gagal mengambil data produk");
    }
  };

  // Tambahkan fungsi handle select product
  const handleSelectProduct = (value: string) => {
    setSelectedProduct(value);
    const availableStock = product.find((item: any) => item.product.id == value);
    setStock(availableStock?.available_stock);
    setPrice(availableStock?.product.price);
  };

  // Tambahkan fungsi add to cart
  const addToCart = () => {
    if (isProduct && !selectedProduct) return;
    
    if (quantity <= 0 || price <= 0) {
      toast.error("Jumlah dan harga harus lebih dari 0");
      return;
    }

    let newItem;
    if (isProduct) {
      const productData = product.find((item: any) => item.product.id == selectedProduct);
      newItem = {
        desc: productData?.product.name,
        amount: quantity,
        price: price,
        sale_price: quantity * price,
        is_product: true,
        product_id: productData?.product.id,
      };
    } else {
      newItem = {
        desc: selectedProduct, // keterangan non-produk
        amount: quantity,
        price: price,
        sale_price: quantity * price,
        is_product: false,
        product_id: null,
      };
    }

    setTransaction({
      ...transaction,
      DetailTransactionDistributor: [
        ...transaction.DetailTransactionDistributor,
        newItem
      ],
      amount: transaction.amount + (quantity * price)
    });

    // Reset form
    setQuantity(0);
    setPrice(0);
    setSubtotal(0);
    setSelectedProduct(undefined);
  };

  // Tambahkan useEffect untuk subtotal
  useEffect(() => {
    setSubtotal(quantity * price);
  }, [quantity, price]);

  // Tambahkan useEffect untuk get product
  useEffect(() => {
    if (user?.id && user?.factory_selected?.id) {
      getProduct();
    }
  }, [user?.id, user?.factory_selected?.id]);

  // Tambahkan fungsi untuk menghapus item dari keranjang
  const removeFromCart = (index: number) => {
    const updatedItems = [...transaction.DetailTransactionDistributor];
    const removedItem = updatedItems[index];
    
    updatedItems.splice(index, 1);
    
    setTransaction({
      ...transaction,
      DetailTransactionDistributor: updatedItems,
      amount: transaction.amount - removedItem.sale_price
    });

    toast.success("Item berhasil dihapus dari keranjang");
  };

  // Tambahkan fungsi untuk handle kembali
  const handleBack = () => {
    router.back();
  };

  if (isLoading) {
    return <MainPage>Memuat...</MainPage>;
  }

  if (!transaction) {
    return <MainPage>Transaksi tidak ditemukan</MainPage>;
  }

  return (
    <MainPage>
      <Card>
        <CardHeader>
          <CardTitle>
            Edit Transaksi - {transaction.invoice_code}
            </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Detail Pembeli */}
            <Card>
              <CardHeader>
                <CardTitle>Identitas Pembeli</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <RadioGroup
                    value={buyerType}
                    onValueChange={(value: "new" | "existing") => setBuyerType(value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="new" id="new" disabled />
                      <Label htmlFor="new">Pembeli Baru</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="existing" id="existing" />
                      <Label htmlFor="existing">Pembeli Lama</Label>
                    </div>
                  </RadioGroup>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Nama Pembeli</Label>
                      <Input value={transaction.buyer.name} disabled />
                    </div>
                    <div>
                      <Label>Alamat</Label>
                      <Input value={transaction.buyer.address} disabled />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tambahkan Card Input Produk */}
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Tambah Item</CardTitle>
              </CardHeader>
              <CardContent>
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
                  <div className={`flex flex-col gap-2 ${!isProduct ? "col-span-2" : ""}`}>
                    <Label>{isProduct ? "Produk" : "Keterangan"}</Label>
                    {isProduct ? (
                      <Select value={selectedProduct} onValueChange={handleSelectProduct}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Produk">
                            {selectedProduct ? 
                              product.find((item: any) => item.product.id == selectedProduct)?.product.name + 
                              " - " + 
                              product.find(item => item.product.id == selectedProduct)?.product.type 
                              : "Pilih Produk"}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {product.map((item: any) => (
                            <SelectItem key={item.product.id} value={item.product.id.toString()}>
                              {item.product.name} - {item.product.type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        type="text"
                        placeholder="Masukkan keterangan transaksi"
                        value={selectedProduct}
                        onChange={(e) => setSelectedProduct(e.target.value)}
                      />
                    )}
                  </div>
                  {isProduct && (
                    <div className="flex flex-col gap-2">
                      <Label>Stock(Ball)</Label>
                      <Input type="text" value={stock || 0} disabled />
                    </div>
                  )}
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
                <div className="flex justify-end mt-3">
                  <Button type="button" onClick={addToCart}>Tambah ke Keranjang</Button>
                </div>
              </CardContent>
            </Card>

            {/* Detail Produk */}
            <Card>
              <CardHeader>
                <CardTitle>Keranjang</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative overflow-x-auto mt-4">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-gray-50">
                      <tr>
                        <th className="px-6 py-3">Produk</th>
                        <th className="px-6 py-3 text-center">Jumlah</th>
                        <th className="px-6 py-3 text-center">Harga</th>
                        <th className="px-6 py-3 text-center">Total</th>
                        <th className="px-6 py-3 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transaction.DetailTransactionDistributor.map((item: any, index: number) => (
                        <tr key={`cart-item-${index}`} className="bg-white border-b">
                          <td className="px-6 py-4">{item.desc}</td>
                          <td className="px-6 py-4 text-center">{item.amount}</td>
                          <td className="px-6 py-4 text-center">
                            Rp {formatRibuan(item.price)}
                          </td>
                          <td className="px-6 py-4 text-center">
                            Rp {formatRibuan(item.sale_price)}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => removeFromCart(index)}
                            >
                              Hapus
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="font-semibold">
                        <td colSpan={3} className="px-6 py-3 text-right">Total:</td>
                        <td className="px-6 py-3 text-center">
                          Rp {formatRibuan(transaction.amount)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Form Pembayaran */}
            <Card>
              <CardHeader>
                <CardTitle>Pembayaran</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Total Belanja</Label>
                    <Input
                      type="text"
                      value={formatRibuan(transaction.amount)}
                      disabled
                    />
                  </div>
                  <div>
                    <Label>Metode Pembayaran</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih metode pembayaran" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentMethodList.map((method) => (
                          <SelectItem key={method.id} value={method.id.toString()}>
                            {method.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
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
                  <div>
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
                  <div>
                    <Label>Total Keseluruhan</Label>
                    <Input
                      type="text"
                      value={formatRibuan(transaction.amount + deliveryCost)}
                      disabled
                    />
                  </div>
                  <div>
                    <Label>Sisa Pembayaran</Label>
                    <Input
                      type="text"
                      value={formatRibuan((transaction.amount - downPayment) + deliveryCost)}
                      disabled
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Catatan Pengiriman</Label>
                    <Textarea
                      value={deliveryNotes}
                      onChange={(e) => setDeliveryNotes(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <Button variant="outline" onClick={handleBack}>
              Kembali
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </MainPage>
  );
}
