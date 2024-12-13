/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { Trash2, Loader2 } from "lucide-react";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectGroup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MainPage from "@/components/main";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useUserStore } from "@/store/user-store";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { id } from "date-fns/locale";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import React from "react";

// Add these utility functions at the top of your file
const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const unformatNumber = (str: string): number => {
  return parseFloat(str.replace(/,/g, "")) || 0;
};

export default function EditPreOrder({ params }: { params:any }) {
  const unwrappedParams: any = React.use(params);
  const router = useRouter();
  const { user: session } = useUserStore();
  const [details, setDetails] = useState<
    Array<{
      desc: string;
      amount: number;
      price: number;
      discount: number;
      sub_total: number;
    }>
  >([]);

  const handleAddDetail = () => {
    setDetails([
      ...details,
      {
        desc: "",
        amount: 0,
        price: 0,
        discount: 0,
        sub_total: 0,
      },
    ]);
  };

  const handleRemoveDetail = (index: number) => {
    setDetails(details.filter((_, i) => i !== index));
  };

  const handleDetailChange = (index: number, field: string, value: any) => {
    const newDetails = [...details];

    if (field === "desc" && value) {
      const selectedProduct: any = products.find((p: any) => p.name === value.name);
      newDetails[index] = {
        ...newDetails[index],
        desc: value.name,
        price: selectedProduct?.price || 0,
      };
    } else if (field === "amount" || field === "price" || field === "discount") {
      const numericValue = unformatNumber(value);
      newDetails[index] = { ...newDetails[index], [field]: numericValue };
    } else {
      newDetails[index] = { ...newDetails[index], [field]: value };
    }

    const amount = newDetails[index].amount;
    const price = newDetails[index].price;
    const discount = newDetails[index].discount;

    if (amount && price) {
      const baseTotal = amount * price;
      const discountAmount = discount ? (baseTotal * (discount / 100)) : 0;
      newDetails[index].sub_total = baseTotal - discountAmount;
    } else {
      newDetails[index].sub_total = 0;
    }

    setDetails(newDetails);

    const newTotal = newDetails.reduce((sum, detail) => sum + (detail.sub_total || 0), 0);
    setTotal(newTotal);
  };

  const [invoiceData, setInvoiceData] = useState({
    maturity_date: "",
    desc: "",
    down_payment: 0,
    payment_method_id: "",
    payment_proof: "",
    notes: "",
    location: "",
    location_cost: 0,
  });

  const calculateTotals = () => {
    const itemAmount = details.reduce((sum, detail) => sum + detail.amount, 0);
    const subTotal = details.reduce((sum, detail) => sum + detail.sub_total, 0);
    const totalBeforeFees = subTotal;
    const total = totalBeforeFees + invoiceData.location_cost;
    const remainingBalance = total - invoiceData.down_payment;

    return { itemAmount, subTotal, total, remainingBalance };
  };

  const { user } = useUserStore();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { itemAmount, subTotal, total, remainingBalance } = calculateTotals();

    const formData2 = new FormData();
    formData2.append("factory_id", user?.factory_selected?.id.toString() || "");
    formData2.append("user_id", user?.id.toString() || "");
    formData2.append("amount", total.toString());
    formData2.append("buyer", user?.username || "");
    formData2.append("sales_man", "");
    formData2.append("recipient", "");
    formData2.append("maturity_date", invoiceData.maturity_date);
    formData2.append("item_amount", itemAmount.toString());
    formData2.append("discon_member", "0");
    formData2.append("buyer_address", "");
    formData2.append("down_payment", invoiceData.down_payment.toString());
    formData2.append("total", total.toString());
    formData2.append("sub_total", subTotal.toString());
    formData2.append("remaining_balance", remainingBalance.toString());
    formData2.append("payment_status", "Pending");
    formData2.append("payment_method_id", invoiceData.payment_method_id);
    formData2.append("notes", invoiceData.notes);
    formData2.append("detail_invoices", JSON.stringify(details.map(detail => ({
      product_id: products.find((p: any) => p.name === detail.desc)?.id,
      amount: detail.amount,
      price: detail.price,
      discount: detail.discount,
      sub_total: detail.sub_total
    }))));
    formData2.append("location", invoiceData.location);
    formData2.append("desc", invoiceData.desc);
    formData2.append("latitude", "0");
    formData2.append("longitude", "0");
    formData2.append("cost", invoiceData.location_cost.toString());
    formData2.append("status", "Pending");
    formData2.append("file", invoiceData.payment_proof);

    try {
      const response = await fetch(`/api/pre-order/${unwrappedParams.id}`, {
        method: "PUT",
        body: formData2,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }

      if (response.ok) {
        toast.success("Pre-order berhasil diperbarui");
        router.push("/distributor/pre-order");
      }
    } catch (error: any) {
      toast.error(error.message || "Terjadi kesalahan saat memperbarui pre-order");
    }
  };

  const [total, setTotal] = useState(0);

  const [products, setProducts] = useState<any>([]);
  const [paymentMethods, setPaymentMethods] = useState<any>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const factoryId = session?.factory_selected?.id;
        const productsResponse = await fetch(
          `/api/product?limit=10000&factory_id=${factoryId}`
        );
        const productsData = await productsResponse.json();
        setProducts(productsData.products || []);

        // Fetch payment methods
        const paymentResponse = await fetch("/api/payment");
        const paymentData = await paymentResponse.json();
        setPaymentMethods(paymentData.payments || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [session]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPreOrder = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/pre-order/${unwrappedParams.id}`);
        const data = await response.json();
        
        if (data.data) {
          const result = data.data;
          
          // Set invoice data
          setInvoiceData({
            maturity_date: result.maturity_date,
            desc: result.desc || "",
            down_payment: result.down_payment || 0,
            payment_method_id: result.payment_method_id?.toString() || "",
            payment_proof: result.payment_proof || "",
            notes: result.notes || "",
            location: result.location || "",
            location_cost: result.location_cost || 0,
          });

          // Set detail items
          if (result.detailInvoices) {
            const formattedDetails = result.detailInvoices.map((detail: any) => ({
              desc: detail.product?.name || "",
              amount: detail.amount || 0,
              price: detail.price || 0,
              discount: detail.discount || 0,
              sub_total: detail.sub_total || 0,
            }));
            setDetails(formattedDetails);
          }
        }
      } catch (error) {
        console.error("Error fetching pre-order:", error);
        toast.error("Gagal mengambil data pre-order");
      } finally {
        setIsLoading(false);
      }
    };

    if (unwrappedParams.id) {
      fetchPreOrder();
    }
  }, [unwrappedParams.id]);

  useEffect(() => {
    // Menghitung total setiap kali details berubah
    const newTotal = details.reduce((sum, detail) => sum + (detail.sub_total || 0), 0);
    setTotal(newTotal);
  }, [details]);

  if (isLoading) {
    return (
      <MainPage>
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Sedang memuat data...
            </p>
          </div>
        </div>
      </MainPage>
    );
  }

  return (
    <MainPage>
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Edit Pre Order</h3>
            </div>
          </CardTitle>
          <CardDescription>
            Edit detail pre order yang sudah ada
          </CardDescription>
        </CardHeader>
        <CardContent className="relative">
          <div className="absolute top-0 right-0 text-sm text-gray-500 mr-4 mt-2">
            <span className="text-red-500">*</span> Wajib diisi
          </div>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {/* Basic Invoice Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="down_payment">
                    Uang Muka <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    inputMode="numeric"
                    required
                    placeholder="Masukkan jumlah uang muka"
                    value={formatNumber(invoiceData.down_payment)}
                    onChange={(e) => setInvoiceData({
                      ...invoiceData,
                      down_payment: unformatNumber(e.target.value),
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment_proof">
                    Bukti Pembayaran
                  </Label>
                  <Input 
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setInvoiceData({ 
                          ...invoiceData, 
                          payment_proof: file as any
                        });
                        // Konversi file ke base64 string
                        // const reader = new FileReader();
                        // reader.onloadend = () => {
                        //   setInvoiceData({ 
                        //     ...invoiceData, 
                        //     payment_proof: reader.result as string 
                        //   });
                        // };
                        // reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment_method">
                    Metode Pembayaran <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    required
                    value={invoiceData.payment_method_id || ""}
                    onValueChange={(value) =>
                      setInvoiceData((prev) => ({
                        ...prev,
                        payment_method_id: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Metode Pembayaran">
                        {paymentMethods.find(
                          (method: any) =>
                            method.id == invoiceData.payment_method_id
                        )?.name || "Pilih Metode Pembayaran"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {paymentMethods.map((method: any) => (
                          <SelectItem
                            key={method.id}
                            value={method.id.toString()}
                          >
                            {method.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maturity_date">
                    Tanggal Jatuh Tempo <span className="text-red-500">*</span>
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !invoiceData.maturity_date && "text-muted-foreground"
                        )}
                        disabled
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {invoiceData.maturity_date ? (
                          format(new Date(invoiceData.maturity_date), "PPP", {
                            locale: id,
                          })
                        ) : (
                          <span>Pilih tanggal</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={
                          invoiceData.maturity_date
                            ? new Date(invoiceData.maturity_date)
                            : undefined
                        }
                        onSelect={(date) =>
                          setInvoiceData((prev) => ({
                            ...prev,
                            maturity_date: date
                              ? format(date, "yyyy-MM-dd")
                              : "",
                          }))
                        }
                        initialFocus
                        disabled
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="col-span-2">
                  <Label htmlFor="catatan">Catatan: </Label>
                  <Textarea
                    id="catatan"
                    name="catatan"
                    value={invoiceData.notes}
                    onChange={(e) =>
                      setInvoiceData({ ...invoiceData, notes: e.target.value })
                    }
                    placeholder="Keterangan pembelian, jangan lupa untuk menambahkan alamat pengiriman"
                  />
                </div>
              </div>

              {/* Detail Items Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Detail Item</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="bg-blue-600 text-white hover:bg-blue-700 hover:text-white"
                    onClick={handleAddDetail}
                  >
                    + Tambah Item
                  </Button>
                </div>

                <div className="relative overflow-x-auto">
                  {details.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <div className="text-gray-500">
                        <svg
                          className="mx-auto h-12 w-12"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium">Keranjang Kosong</h3>
                        <p className="mt-1 text-sm text-gray-400">
                          Mulai dengan menambahkan item ke keranjang
                        </p>
                      </div>
                    </div>
                  ) : (
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs uppercase bg-gray-50">
                        <tr>
                          <th className="px-4 py-2">
                            Deskripsi <span className="text-red-500">*</span>
                          </th>
                          <th className="px-4 py-2">
                            Jumlah <span className="text-red-500">*</span>
                          </th>
                          <th className="px-4 py-2">
                            Harga <span className="text-red-500">*</span>
                          </th>
                          <th className="px-4 py-2">Diskon (%)</th>
                          <th className="px-4 py-2">Sub Total</th>
                          <th className="px-4 py-2"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {details.map((detail, index) => (
                          <tr key={index} className="border-b">
                            <td className="px-4 py-2">
                              <div>
                                <Select
                                  value={detail.desc}
                                  onValueChange={(value) => {
                                    const selectedProduct = products.find((product: any) => product.name === value);
                                    handleDetailChange(index, "desc", selectedProduct)
                                  }}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Pilih Produk" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectGroup>
                                      {products.map((product: any) => (
                                        <SelectItem
                                          key={product.id}
                                          value={product.name}
                                        >
                                          {product.name} - {product.type}
                                        </SelectItem>
                                      ))}
                                    </SelectGroup>
                                  </SelectContent>
                                </Select>
                                {products.find(
                                  (product: any) => product.name == detail.desc
                                ) && (
                                  <input
                                    type="hidden"
                                    name="product_id"
                                    value={
                                      products.find(
                                        (product: any) =>
                                          product.name == detail.desc
                                      )?.id
                                    }
                                  />
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-2">
                              <Input
                                type="text"
                                value={formatNumber(detail.amount)}
                                onChange={(e) =>
                                  handleDetailChange(
                                    index,
                                    "amount",
                                    e.target.value
                                  )
                                }
                                placeholder="0"
                              />
                            </td>
                            <td className="px-4 py-2">
                              <Input
                                type="text"
                                value={formatNumber(detail.price)}
                                onChange={(e) =>
                                  handleDetailChange(
                                    index,
                                    "price",
                                    e.target.value
                                  )
                                }
                                placeholder="0"
                                disabled
                                className="bg-gray-50"
                              />
                            </td>
                            <td className="px-4 py-2">
                              <Input
                                type="text"
                                value={formatNumber(detail.discount)}
                                onChange={(e) =>
                                  handleDetailChange(
                                    index,
                                    "discount",
                                    e.target.value
                                  )
                                }
                                placeholder="0"
                              />
                            </td>
                            <td className="px-4 py-2">
                              <Input
                                type="text"
                                value={formatNumber(detail.sub_total)}
                                disabled
                                className="bg-gray-50"
                              />
                            </td>
                            <td className="px-4 py-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveDetail(index)}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
              {/* Summary Section */}
              <div className="border-t mt-2 pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Sub Total:</span>
                        <span className="font-semibold">
                          {new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                          }).format(total)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                          Uang Muka:
                        </span>
                        <span className="font-semibold">
                          - {new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                          }).format(invoiceData.down_payment)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-lg border-t pt-2">
                        <span className="font-medium">Total:</span>
                        <span className="font-bold text-blue-600">
                          {new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                          }).format(
                            total +
                              invoiceData.location_cost -
                              invoiceData.down_payment
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Sisa Pembayaran</Label>
                    <div
                      className={`p-2 rounded-md font-semibold text-right ${
                        total +
                          invoiceData.location_cost -
                          invoiceData.down_payment >
                        0
                          ? "bg-red-50 text-red-600"
                          : "bg-green-50 text-green-600"
                      }`}
                    >
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                      }).format(
                        total +
                          invoiceData.location_cost -
                          invoiceData.down_payment
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Batal
              </Button>
              <Button 
                type="submit"
              >
                Simpan
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </MainPage>
  );
}