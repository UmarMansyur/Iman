/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { Trash2, ChevronsUpDown, Check } from "lucide-react";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectGroup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
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
import { convert } from "@/lib/number";
import {
  Command,
  CommandInput,
  CommandItem,
  CommandGroup,
  CommandEmpty,
  CommandList,
} from "@/components/ui/command";
import { Calendar } from "@/components/ui/calendar";

// Add these utility functions at the top of your file
// Add these utility functions at the top of your file
const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const unformatNumber = (value: string | number): number => {
  // If value is already a number, return it
  if (typeof value === "number") {
    return value;
  }

  // If empty string, return 0
  if (value === "") {
    return 0;
  }

  // Convert to string if not already
  const str = value.toString();

  // Remove commas and convert to number
  const num = Number(str.replace(/,/g, ""));

  // Check if result is NaN
  if (Number.isNaN(num)) {
    return 0;
  }

  return num;
};

export default function InvoiceForm() {
  const router = useRouter();
  const { user: session } = useUserStore();
  const [details, setDetails] = useState<
    Array<{
      desc: string;
      amount: number;
      price: number;
      discount: number;
      product_id: number;
      is_product: boolean;
      sub_total: number;
    }>
  >([]);

  const handleAddDetail = () => {
    // Cek apakah ada detail yang belum diisi
    const hasEmptyDetail = details.some((detail) => !detail.desc);

    if (hasEmptyDetail) {
      toast.error("Harap isi produk yang kosong terlebih dahulu");
      return;
    }

    setDetails([
      ...details,
      {
        desc: "",
        amount: 0,
        price: 0,
        is_product: false,
        discount: 0,
        sub_total: 0,
        product_id: 0,
      },
    ]);
  };

  const handleRemoveDetail = (index: number) => {
    setDetails(details.filter((_, i) => i !== index));
  };

  const handleDetailChange = (index: number, field: string, value: any) => {
    const newDetails = [...details];
    if (field === "product_id") {
      const selectedProduct = products.find((p: any) => p.id == value);
      newDetails[index] = {
        ...newDetails[index],
        is_product: true,
        desc: selectedProduct?.name + " - " + selectedProduct?.type,
        price: selectedProduct?.price || 0,
        product_id: value,
      };
    } else if (
      field === "amount" ||
      field === "price" ||
      field === "discount"
    ) {
      const numericValue = unformatNumber(value);
      newDetails[index] = { ...newDetails[index], [field]: numericValue };
    } else {
      newDetails[index] = { ...newDetails[index], [field]: value };
    }

    // Recalculate sub_total
    newDetails[index].sub_total =
      newDetails[index].amount *
      newDetails[index].price *
      (1 - newDetails[index].discount / 100);

    setDetails(newDetails);

    // Update total
    const newTotal = newDetails.reduce(
      (sum: number, detail: any) => sum + detail.sub_total,
      0
    );
    setTotal(newTotal);
  };

  // Basic invoice state
  const [invoiceData, setInvoiceData] = useState({
    buyer: "",
    sales_man: "",
    recipient: "",
    maturity_date: "",
    buyer_address: "",
    desc: "",
    down_payment: 0,
    payment_method_id: "",
    discon_member: 0,
    shipping_address: "",
    shipping_cost: 0,
    notes: "",
    location: "",
    location_cost: 0,
  });

  // Calculate totals
  const calculateTotals = () => {
    const itemAmount = details.reduce((sum, detail) => sum + detail.amount, 0);
    const subTotal = details.reduce((sum, detail) => sum + detail.sub_total, 0);
    const totalBeforeFees = subTotal - invoiceData.discon_member;
    const total =
      totalBeforeFees + invoiceData.shipping_cost + invoiceData.location_cost;
    const remainingBalance = total - invoiceData.down_payment;

    return { itemAmount, subTotal, total, remainingBalance };
  };

  const { user } = useUserStore();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // If it's a new buyer, create it first
      if (
        buyerType === "regular" &&
        !buyers.find((b) => b.name === invoiceData.buyer)
      ) {
        const buyerResponse: any = await fetch("/api/buyer", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: invoiceData.buyer,
            address: invoiceData.buyer_address,

            factory_id: session?.factory_selected?.id,
          }),
        });

        if (!buyerResponse.ok) {
          throw new Error("Failed to create new buyer");
        }

        invoiceData.buyer = buyerResponse.id;
      }

      const { itemAmount, subTotal, total, remainingBalance } =
        calculateTotals();
      const formData = {
        ...invoiceData,
        item_amount: itemAmount,
        sub_total: subTotal,
        total: total,
        remaining_balance: remainingBalance,
        detailInvoices: details,
        payment_status: "Paid",
        factory_id: session?.factory_selected?.id,
        user_id: user?.id,
        desc: invoiceData.notes,
        cost: invoiceData.shipping_cost,
        location: invoiceData.location,
        location_cost: invoiceData.location_cost,
        buyer_id: invoiceData.buyer,
      };

      // jika lokasi tidak ada maka buat lokasi baru terlebih dahulu
      if (!locations.find((l) => l.name === invoiceData.location)) {
        const locationResponse = await fetch("/api/location", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: invoiceData.shipping_address,
            cost: invoiceData.shipping_cost,
            factory_id: session?.factory_selected?.id,
          }),
        });
        const locationData = await locationResponse.json();
        invoiceData.location = locationData.data.id;
      }

      const response = await fetch("/api/transaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }

      if (response.ok) {
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
      router.push("/operator/transaksi");
    } catch (error: any) {
      toast.error(error.message || "Terjadi kesalahan, silahkan coba lagi");
    }
  };

  const [total, setTotal] = useState(0);

  const [openBuyer, setOpenBuyer] = useState(false);
  const [valueBuyer, setValueBuyer] = useState("");

  const [buyers, setBuyers] = useState<
    Array<{ id: string | number; name: string; address: string }>
  >([]);
  const [distributors, setDistributors] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      const factoryId = session?.factory_selected?.id;
      const productsResponse = await fetch(
        `/api/product?limit=10000&factory_id=${factoryId}`
      );
      const productsData = await productsResponse.json();
      setProducts(productsData.products || []);

      const paymentResponse = await fetch("/api/payment");
      const paymentData = await paymentResponse.json();
      setPaymentMethods(paymentData.payments || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setProducts([]);
      setPaymentMethods([]);
    }
  };

  const fetchLocation = async () => {
    try {
      const response = await fetch(
        `/api/location?limit=10000&factory_id=${user?.factory_selected?.id}`
      );
      const data = await response.json();
      setLocations(data.locations || []);
    } catch (error) {
      console.error("Error fetching locations:", error);
      setLocations([]);
    }
  };

  useEffect(() => {
    if (session?.factory_selected?.id) {
      fetchLocation();
      fetchData();
      fetchBuyers();
      fetchDistributors();
    }
  }, [session?.factory_selected?.id]);

  // Pertama, tambahkan fungsi untuk mengecek stock
  const isExceedingStock = (productId: number, amount: number) => {
    const product = products.find((p: any) => p.id === productId);
    return product && amount > product.stock;
  };

  // Tambahkan fungsi untuk mengecek apakah ada item yang melebihi stok
  const hasExceedingStock = () => {
    return details.some((detail) => {
      if (detail.is_product && detail.desc) {
        const product = products.find((p: any) => p.name === detail.desc);
        return product && detail.amount > product.stock;
      }
      return false;
    });
  };

  const [buyerType, setBuyerType] = useState<"distributor" | "regular">(
    "regular"
  );

  const fetchBuyers = async () => {
    try {
      const response = await fetch(
        `/api/buyer?factory_id=${session?.factory_selected?.id}`
      );
      const data = await response.json();

      if (Array.isArray(data)) {
        setBuyers(data);
      } else {
        setBuyers([]);
        console.warn("Buyers data is not in expected format:", data);
      }
    } catch (error) {
      console.error("Error fetching buyers:", error);
      setBuyers([]);
    }
  };

  const fetchDistributors = async () => {
    try {
      const response = await fetch(
        `/api/member-factory?role_id=3&factory_id=${session?.factory_selected?.id}`
      );
      const data = await response.json();
      setDistributors(data || []);
    } catch (error) {
      console.error("Error fetching distributors:", error);
      setDistributors([]);
    }
  };

  const [openLocation, setOpenLocation] = useState(false);
  const [valueLocation, setValueLocation] = useState("");

  const isProductSelected = (productId: number, currentIndex: number) => {
    return details.some(
      (detail, index) =>
        detail.product_id === productId && index !== currentIndex
    );
  };

  return (
    <MainPage>
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Tambah Transaksi</h3>
            </div>
          </CardTitle>
          <CardDescription>
            Jika anda ingin melakukan transaksi non produk, silahkan pilih
            &quot;Transaksi Non Produk&quot;.
          </CardDescription>
        </CardHeader>
        <CardContent className="relative">
          <div className="absolute top-0 left-5 text-sm text-gray-500 mr-4 mt-2">
            <span className="text-red-500">*</span> Wajib diisi
          </div>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
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

                <div className="space-y-4">
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
                        <h3 className="mt-2 text-sm font-medium">
                          Keranjang Kosong
                        </h3>
                        <p className="mt-1 text-sm text-gray-400">
                          Mulai dengan menambahkan item ke keranjang
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                      {details.map((detail, index) => (
                        <div
                          key={index}
                          className="bg-white rounded-lg border p-4 space-y-3"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-center space-x-2">
                              <Switch
                                className="mr-2"
                                checked={detail.is_product}
                                onCheckedChange={(checked) =>
                                  handleDetailChange(
                                    index,
                                    "is_product",
                                    checked
                                  )
                                }
                              />
                              <Label>
                                {detail.is_product ? "Produk" : "Non-Produk"}
                              </Label>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveDetail(index)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>
                                Deskripsi{" "}
                                <span className="text-red-500">*</span>
                              </Label>
                              {detail.is_product ? (
                                <Select
                                  value={detail.product_id?.toString() || ""}
                                  onValueChange={(value) => {
                                    const selectedProduct = products.find(
                                      (p) => p.id.toString() === value
                                    );
                                    if (selectedProduct) {
                                      handleDetailChange(
                                        index,
                                        "product_id",
                                        selectedProduct.id
                                      );
                                    }
                                  }}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Pilih Produk">
                                      {detail.desc || "Pilih Produk"}
                                    </SelectValue>
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectGroup>
                                      {products.map((product) => (
                                        <SelectItem
                                          key={product.id}
                                          value={product.id.toString()}
                                          disabled={isProductSelected(
                                            product.id,
                                            index
                                          )}
                                        >
                                          {product.name} - {product.type}
                                          {isProductSelected(
                                            product.id,
                                            index
                                          ) && " (Sudah dipilih)"}
                                        </SelectItem>
                                      ))}
                                    </SelectGroup>
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Input
                                  value={detail.desc}
                                  onChange={(e) =>
                                    handleDetailChange(
                                      index,
                                      "desc",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Deskripsi item"
                                />
                              )}
                            </div>

                            {/* Tambahkan kolom Stok Pack */}
                            {detail.is_product && (
                              <div className="space-y-2">
                                <Label>Stok (Pack)</Label>
                                <Input
                                  type="text"
                                  value={
                                    products.find(
                                      (p: any) => p.id === detail.product_id
                                    )?.stock || 0
                                  }
                                  disabled
                                  className="bg-gray-50"
                                />
                              </div>
                            )}

                            {/* Tambahkan kolom Stok Bal */}
                            {detail.is_product && (
                              <div className="space-y-2">
                                <Label>Stok (Bal)</Label>
                                <Input
                                  type="text"
                                  value={
                                    convert(
                                      products.find(
                                        (p: any) => p.id === detail.product_id
                                      )?.stock || 0
                                    ).bal
                                  }
                                  disabled
                                  className="bg-gray-50"
                                />
                              </div>
                            )}

                            <div className="space-y-2">
                              <Label>
                                Jumlah <span className="text-red-500">*</span>
                              </Label>
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
                                className={
                                  detail.is_product &&
                                  isExceedingStock(
                                    detail.product_id,
                                    detail.amount
                                  )
                                    ? "border-red-500 focus-visible:ring-red-500"
                                    : ""
                                }
                              />
                              {detail.is_product && (
                                <small className="text-gray-500">
                                  Masukkan jumlah dalam bentuk bal.
                                </small>
                              )}
                            </div>

                            <div className="space-y-2">
                              <Label>
                                Harga <span className="text-red-500">*</span>
                              </Label>
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
                                disabled={detail.is_product}
                                className={
                                  detail.is_product ? "bg-gray-50" : ""
                                }
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Diskon (%)</Label>
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
                            </div>
                          </div>

                          <div className="pt-3 border-t">
                            <div className="flex justify-between items-center">
                              <Label>Sub Total:</Label>
                              <Input
                                type="text"
                                value={formatNumber(detail.sub_total)}
                                disabled
                                className="bg-gray-50 w-40 text-right"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <span className="text-red-500 text-xs">
                Jika jumlah melebihi stock yang tersedia, maka inputan jumlah
                akan berwarna merah.
              </span>
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
                          Biaya Pengiriman:
                        </span>
                        <span className="font-semibold">
                          {new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                          }).format(invoiceData.shipping_cost)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Uang Muka:</span>
                        <span className="font-semibold">
                          -{" "}
                          {new Intl.NumberFormat("id-ID", {
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
                              invoiceData.shipping_cost +
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
                          invoiceData.shipping_cost +
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
                          invoiceData.shipping_cost +
                          invoiceData.location_cost -
                          invoiceData.down_payment
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Basic Invoice Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipe Pembeli</Label>
                  <Select
                    value={buyerType}
                    onValueChange={(value: "distributor" | "regular") => {
                      setBuyerType(value);
                      setInvoiceData({
                        ...invoiceData,
                        buyer: "",
                        buyer_address: "",
                        shipping_cost:
                          value === "distributor"
                            ? 0
                            : invoiceData.shipping_cost,
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih tipe pembeli" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="regular">Pembeli Biasa</SelectItem>
                      <SelectItem value="distributor">Distributor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="buyer">
                    Pembeli <span className="text-red-500">*</span>
                  </Label>
                  {buyerType === "distributor" ? (
                    <Select
                      required
                      value={invoiceData.buyer}
                      onValueChange={(value) => {
                        const distributor = distributors.find(
                          (d) => d.user.id.toString() === value
                        );
                        setInvoiceData({
                          ...invoiceData,
                          buyer: value,
                          buyer_address: distributor?.user.address || "",
                          shipping_cost: 0,
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Distributor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {distributors.map((distributor) => (
                            <SelectItem
                              key={distributor.user.id}
                              value={distributor.user.id.toString()}
                            >
                              {distributor.user.username}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex w-full">
                      <Popover open={openBuyer} onOpenChange={setOpenBuyer}>
                        <PopoverTrigger asChild className="w-full">
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openBuyer}
                            className="w-full justify-between"
                          >
                            {valueBuyer || "Select buyer..."}
                            <ChevronsUpDown className="opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command className="md:w-[620px]">
                            <CommandInput
                              placeholder="Cari pembeli..."
                              value={valueBuyer}
                              onValueChange={setValueBuyer}
                            />
                            <CommandList>
                              <CommandEmpty className="p-2">
                                <div className="flex flex-col gap-2">
                                  <span className="text-sm">
                                    Tidak ada pembeli yang ditemukan.
                                  </span>
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => {
                                      setValueBuyer(valueBuyer);
                                      setInvoiceData({
                                        ...invoiceData,
                                        buyer: valueBuyer,
                                      });
                                      setOpenBuyer(false);
                                    }}
                                  >
                                    Gunakan &quot;{valueBuyer}&quot;
                                  </Button>
                                </div>
                              </CommandEmpty>
                              <CommandGroup>
                                {buyers.map((buyer) => (
                                  <CommandItem
                                    key={buyer.name}
                                    value={buyer.name}
                                    onSelect={(currentValue) => {
                                      setValueBuyer(currentValue);
                                      setInvoiceData({
                                        ...invoiceData,
                                        buyer: currentValue,
                                        buyer_address: buyer.address,
                                      });
                                      setOpenBuyer(false);
                                    }}
                                  >
                                    {buyer.name}
                                    <Check
                                      className={cn(
                                        "ml-auto",
                                        valueBuyer === buyer.name
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="buyer_address">
                    Alamat Pembeli <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    required
                    placeholder="Alamat pembeli"
                    value={invoiceData.buyer_address}
                    disabled={buyerType === "distributor"}
                    onChange={(e) =>
                      setInvoiceData({
                        ...invoiceData,
                        buyer_address: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="down_payment">
                    Uang Muka <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    inputMode="numeric"
                    required
                    placeholder="Masukkan jumlah uang muka"
                    value={formatNumber(invoiceData.down_payment)}
                    onChange={(e) =>
                      setInvoiceData({
                        ...invoiceData,
                        down_payment: unformatNumber(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discon_member">
                    Diskon Member <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    required
                    placeholder="Masukkan diskon member"
                    value={formatNumber(invoiceData.discon_member)}
                    onChange={(e) =>
                      setInvoiceData({
                        ...invoiceData,
                        discon_member: unformatNumber(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment_method">
                    Metode Pembayaran <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    required
                    value={invoiceData.payment_method_id || ""}
                    onValueChange={(value) => {
                      console.log(value);
                      setInvoiceData((prev) => ({
                        ...prev,
                        payment_method_id: value,
                      }));
                    }}
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
                          setInvoiceData({
                            ...invoiceData,
                            maturity_date: date ? date.toISOString() : "",
                          })
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label htmlFor="catatan">Catatan: </Label>
                  <Textarea
                    id="catatan"
                    name="catatan"
                    value={invoiceData.notes}
                    onChange={(e) =>
                      setInvoiceData({ ...invoiceData, notes: e.target.value })
                    }
                    placeholder="Keterangan pembelian"
                  />
                </div>
              </div>

              {/* Shipping and Location Details */}
              {/* jika bukan distributor */}
              {buyerType !== "distributor" && (
                <div className="border-t mt-4 pt-4">
                  <h4 className="font-medium mb-4">
                    Informasi Pengiriman & Lokasi
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="shipping_address">
                        Alamat Pengiriman{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <div className="flex w-full">
                        <Popover
                          open={openLocation}
                          onOpenChange={setOpenLocation}
                        >
                          <PopoverTrigger asChild className="w-full">
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={openLocation}
                              className="w-full justify-between"
                            >
                              {valueLocation || "Pilih lokasi..."}
                              <ChevronsUpDown className="opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0">
                            <Command className="md:w-[620px]">
                              <CommandInput
                                placeholder="Cari lokasi..."
                                value={valueLocation}
                                onValueChange={setValueLocation}
                              />
                              <CommandList>
                                <CommandEmpty className="p-2">
                                  <div className="flex flex-col gap-2">
                                    <span className="text-sm">
                                      Tidak ada lokasi yang ditemukan.
                                    </span>
                                    <Button
                                      variant="secondary"
                                      size="sm"
                                      onClick={() => {
                                        setValueLocation(valueLocation);
                                        setInvoiceData({
                                          ...invoiceData,
                                          shipping_address: valueLocation,
                                          shipping_cost: 0,
                                        });
                                        setOpenLocation(false);
                                      }}
                                    >
                                      Gunakan &quot;{valueLocation}&quot;
                                    </Button>
                                  </div>
                                </CommandEmpty>
                                <CommandGroup>
                                  {locations.map((location: any) => (
                                    <CommandItem
                                      key={location.id}
                                      value={location.name}
                                      onSelect={(currentValue) => {
                                        setValueLocation(currentValue);
                                        setInvoiceData({
                                          ...invoiceData,
                                          shipping_address: currentValue,
                                          shipping_cost: location.cost || 0,
                                        });
                                        setOpenLocation(false);
                                      }}
                                    >
                                      {location.name}
                                      <Check
                                        className={cn(
                                          "ml-auto",
                                          valueLocation === location.name
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="shipping_cost">
                        Biaya Pengiriman <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        inputMode="numeric"
                        required
                        disabled={locations.some(
                          (loc) => loc.name === valueLocation
                        )}
                        placeholder="Masukkan biaya pengiriman"
                        value={formatNumber(invoiceData.shipping_cost)}
                        onChange={(e) =>
                          setInvoiceData({
                            ...invoiceData,
                            shipping_cost: unformatNumber(e.target.value),
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="notes">Catatan</Label>
                      <Textarea
                        placeholder="Nama penerima, nomor telepon, jalan, kelurahan, kecamatan, kota, provinsi, dan kode pos"
                        value={invoiceData.desc}
                        onChange={(e) =>
                          setInvoiceData({
                            ...invoiceData,
                            desc: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              )}
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
                disabled={hasExceedingStock()}
                className={
                  hasExceedingStock() ? "opacity-50 cursor-not-allowed" : ""
                }
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
