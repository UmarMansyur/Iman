/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
// import { RadioGroup, RadioGroupItem } from "@/components/email/ui/radio-group";
import MainPage from "@/components/main";
import {
  Card,
  CardHeader,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  CalendarIcon,
  Check,
  Search,
  SearchCheckIcon,
  Trash,
} from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { useUserStore } from "@/store/user-store";
import { redirect, useParams } from "next/navigation";
import { format } from "date-fns";
import EmptyData from "@/components/views/empty-data";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  TableHead,
  TableHeader,
  TableRow,
  Table,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import toast from "react-hot-toast";
import LoaderScreen from "@/components/views/loader";

export default function TransaksiJasa() {
  const [buyer, setBuyer] = useState({
    name: "",
    address: "",
  });
  const { id } = useParams();
  const [open, setOpen] = useState(false);
  const { user } = useUserStore();
  const [dataService, setDataService] = useState([]);
  const [dataPayment, setDataPayment] = useState([]);
  const [dataBuyer, setDataBuyer] = useState([]);
  const [filteredBuyer, setFilteredBuyer] = useState([]);
  const [openService, setOpenService] = useState(false);
  const [searchService, setSearchService] = useState("");
  const [filteredService, setFilteredService] = useState([]);
  const [desc, setDesc] = useState("");

  // Current Item States with proper initialization
  const [selectedService, setSelectedService] = useState<string>("");
  const [amount, setQuantity] = useState<number>(1);
  const [price, setPrice] = useState<number>(0);
  const [subtotal, setSubtotal] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [subtotalDiscount, setSubtotalDiscount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [dataId, setDataId] = useState<string>("");

  const [cart, setCart] = useState<any[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);

  const [paymentDetails, setPaymentDetails] = useState<{
    downPayment: number;
    paymentMethod: string;
    remainingPayment: number;
    dueDate: any | null;
  }>({
    downPayment: 0,
    paymentMethod: "",
    remainingPayment: 0,
    dueDate: null,
  });

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

  const handleBuyerSelect = (buyer: any) => {
    setBuyer(buyer);
    setOpen(false);
  };

  const fetchDataService = async () => {
    try {
      if (!user?.factory_selected?.id) {
        console.error("No factory selected");
        return;
      }

      const response = await fetch(
        `/api/service?limit=100000&page=1&factory_id=${user.factory_selected.id}`
      );
      const data = await response.json();

      if (Array.isArray(data.data) && data.data.length > 0) {
        setDataService(data.data);
        setFilteredService(data.data);
      } else {
        redirect("/operator/service");
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      setDataService([]);
      setFilteredService([]);
    }
  };

  const fetchDataBuyer = async () => {
    try {
      const response = await fetch(
        "/api/buyer?limit=1000&page=1&factory_id=" + user?.factory_selected?.id
      );
      const data = await response.json();
      setDataBuyer(data);
      setFilteredBuyer(data);
    } catch (error) {
      console.error("Error fetching buyer:", error);
      setDataBuyer([]);
      setFilteredBuyer([]);
    }
  };

  const fetchDataTransaction = async () => {
    const response = await fetch(`/api/transaction-service/${id}`);
    const data = await response.json();
    if (data) {
      setBuyer(data.buyer);
      setDesc(data.desc);
      const cartItem: any[] = [];
      data.DetailTransactionService.map((item: any) => {
        cartItem.push({
          id: item.id,
          service: item.service.name,
          amount: item.amount,
          price: item.service.price,
          subtotal: item.service.price * item.amount,
          discount: item.discount,
          subtotal_discount: item.subtotal_discount
            ? item.subtotal_discount
            : 0,
        });
      });
      setPaymentDetails({
        downPayment: data.down_payment,
        paymentMethod: data.payment_method_id,
        remainingPayment: data.remaining_payment,
        dueDate: new Date(data.maturity_date),
      });
      setDataId(data.id);
      setCart(cartItem);
    }
  };

  const [searchBuyer, setSearchBuyer] = useState("");
  const handleSearchBuyer = () => {
    const filteredBuyer = dataBuyer.filter((buyer: any) =>
      buyer.name.toLowerCase().includes(searchBuyer.toLowerCase())
    );
    setFilteredBuyer(filteredBuyer);
  };

  const fetchDataPayment = async () => {
    try {
      const response = await fetch("/api/payment?limit=1000&page=1");
      const data = await response.json();
      if (Array.isArray(data.payments)) {
        setDataPayment(data.payments);
      }
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      setDataPayment([]);
    }
  };

  useEffect(() => {
    if (user?.factory_selected?.id) {
      setIsLoading(true);
      fetchDataService();
      fetchDataPayment();
      fetchDataBuyer();
      fetchDataTransaction();
      setIsLoading(false);
    }
  }, [user?.factory_selected?.id]);

  const handleServiceSelect = (service: any) => {
    setPrice(service.price);
    setSelectedService(service.name);
    setOpenService(false);
  };

  const handleQuantityChange = (e: any) => {
    const rawValue = unformatIDR(e.target.value);
    setQuantity(Math.max(1, rawValue));
  };

  const handlePriceChange = (e: any) => {
    const rawValue = unformatIDR(e.target.value);
    setPrice(rawValue);
  };

  const handleSearchService = () => {
    const filteredService = dataService.filter((service: any) =>
      service.name.toLowerCase().includes(searchService.toLowerCase())
    );
    setFilteredService(filteredService);
  };

  useEffect(() => {
    setSubtotal(amount * price);
  }, [amount, price]);

  useEffect(() => {
    const total = cart.reduce(
      (sum: number, item: any) => sum + (item.subtotal || 0),
      0
    );
    setTotalAmount(total);

    setPaymentDetails((prev) => ({
      ...prev,
      remainingPayment: total - (prev.downPayment || 0),
    }));
  }, [cart]);

  const addToCart = () => {
    if (!selectedService || !amount || !price) {
      alert("Please fill in all service details");
      return;
    }

    const disconPrice = (price * discount) / 100;
    const newItem: any = {
      id: Date.now(),
      service: selectedService,
      amount: amount,
      price: price,
      subtotal: amount * price,
      discount: disconPrice,
      subtotal_discount: amount * price - disconPrice,
    };

    // jika sudah ada service di cart, maka update amount dan subtotal
    const existingItem = cart.find(
      (item: any) => item.service === selectedService
    );
    if (existingItem) {
      toast.error("Service sudah ada di cart");
    } else {
      setCart((prev) => [...prev, newItem]);
      setSelectedService("");
      setQuantity(1);
      setPrice(0);
      setSubtotal(0);
    }
  };

  const removeFromCart = (itemId: any) => {
    if (itemId) {
      setCart((prev) => prev.filter((item) => item.id !== itemId));
    }
  };

  const formatIDR = (number: number) => {
    return number?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const unformatIDR = (formattedNumber: string) => {
    return parseInt(formattedNumber.replace(/\./g, "")) || 0;
  };

  useEffect(() => {
    const remainingPayment = totalAmount - (paymentDetails.downPayment || 0);
    if (remainingPayment < 0) {
      setPaymentDetails((prev) => ({
        ...prev,
        remainingPayment: 0,
      }));
    } else {
      setPaymentDetails((prev) => ({
        ...prev,
        remainingPayment: remainingPayment,
      }));
    }
  }, [totalAmount, paymentDetails.downPayment]);

  useEffect(() => {
    const disconPrice = (price * discount) / 100;
    setSubtotalDiscount(subtotal - disconPrice);
  }, [discount, price, subtotal]);

  const [currentServicePage, setCurrentServicePage] = useState(1);
  const servicePerPage = 5;

  const totalServicePages = Math.ceil(filteredService.length / servicePerPage);

  const getCurrentServicePageData = () => {
    const startIndex = (currentServicePage - 1) * servicePerPage;
    const endIndex = startIndex + servicePerPage;
    return filteredService.slice(startIndex, endIndex);
  };

  const handleCancel = () => {
    redirect("/operator/transaksi-jasa");
  };

  const handleSave = async () => {
    if (!dataId) {
      toast.error("Data tidak ditemukan");
      return;
    }
    const payload = {
      buyer: buyer.name,
      address: buyer.address,
      cart: cart,
      down_payment: paymentDetails.downPayment,
      payment_method: paymentDetails.paymentMethod,
      due_date: paymentDetails.dueDate,
      user_id: user?.id,
      factory_id: user?.factory_selected?.id,
      desc: desc,
    };

    const response = await fetch(`/api/transaction-service/${dataId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) {
      toast.error(data.message);
    } else {
      toast.success(data.message);
      redirect("/operator/transaksi-jasa");
    }
  };

  return (
    <MainPage>
      {isLoading ? (
        <LoaderScreen></LoaderScreen>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Ubah Transaksi Jasa</CardTitle>
            <CardDescription>
              Isi data transaksi jasa dengan benar
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Buyer Information */}
            <div className="flex flex-col gap-2 mt-3">
              <Label>Nama Pembeli</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder="Nama Pembeli"
                  value={buyer.name || ""}
                  onChange={(e) =>
                    setBuyer((prev) => ({
                      ...prev,
                      name: e.target.value || "",
                    }))
                  }
                />
                {/* buatkan dialog untuk pilih buyer */}
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

            {/* Buyer Address */}
            <div className="flex flex-col gap-2 mt-3">
              <Label>Alamat Pembeli</Label>
              <Textarea
                placeholder="Alamat Pembeli"
                value={buyer.address}
                onChange={(e) =>
                  setBuyer((prev) => ({
                    ...prev,
                    address: e.target.value || "",
                  }))
                }
              />
            </div>
            <div className="flex flex-col gap-2 mt-3">
              <Label>Keterangan</Label>
              <Textarea
                placeholder="Keterangan"
                value={desc}
                onChange={(e: any) => setDesc(e.target.value)}
              />
            </div>

            {/* Service Selection */}
            <div className="grid grid-cols-2 items-center mt-2 gap-4">
              <div>
                <Label className="text-sm">Jenis Jasa</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    value={selectedService || ""}
                    onChange={(e) => setSelectedService(e.target.value)}
                    placeholder="Jenis Jasa"
                  />
                  <Dialog open={openService} onOpenChange={setOpenService}>
                    <DialogTrigger asChild>
                      <div className="flex items-center border p-3 rounded-md cursor-pointer bg-blue-500 text-white">
                        <SearchCheckIcon className="w-4 h-4" />
                      </div>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Pilih Jenis Jasa</DialogTitle>
                        <DialogDescription>
                          Pilih jenis jasa dari list jasa
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex items-center gap-2 mt-3">
                        <Input
                          type="text"
                          placeholder="Cari Jenis Jasa"
                          value={searchService}
                          onChange={(e) => setSearchService(e.target.value)}
                        />
                        <Button type="button" onClick={handleSearchService}>
                          <Search className="w-4 h-4" />
                        </Button>
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nama</TableHead>
                            <TableHead>Harga</TableHead>
                            <TableHead className="text-center">Aksi</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {getCurrentServicePageData().map((service: any) => (
                            <TableRow key={service.id}>
                              <TableCell>{service.name}</TableCell>
                              <TableCell>
                                Rp. {formatIDR(service.price)}
                              </TableCell>
                              <TableCell className="text-center">
                                <Button
                                  size="sm"
                                  onClick={() => handleServiceSelect(service)}
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                          {filteredService.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={3} className="text-center">
                                <EmptyData text="Tidak ada jenis jasa yang ditemukan" />
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>

                      {/* Tambahkan kontrol paginasi untuk service */}
                      <div className="flex items-center justify-end space-x-2 py-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentServicePage((prev) =>
                              Math.max(prev - 1, 1)
                            )
                          }
                          disabled={currentServicePage === 1}
                        >
                          Sebelumnya
                        </Button>
                        <div className="text-sm">
                          Halaman {currentServicePage} dari {totalServicePages}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentServicePage((prev) =>
                              Math.min(prev + 1, totalServicePages)
                            )
                          }
                          disabled={currentServicePage === totalServicePages}
                        >
                          Selanjutnya
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Quantity and Price Inputs */}
              <div>
                <Label className="text-sm">Jumlah</Label>
                <Input
                  type="text"
                  value={formatIDR(amount)}
                  onChange={handleQuantityChange}
                  placeholder="Masukkan jumlah"
                />
              </div>
              <div>
                <Label className="text-sm">Harga Satuan</Label>
                <Input
                  type="text"
                  value={formatIDR(price)}
                  onChange={handlePriceChange}
                  placeholder="Masukkan harga"
                />
              </div>
              <div>
                <Label className="text-sm">Diskon(%)</Label>
                <Input
                  type="text"
                  value={formatIDR(discount)}
                  onChange={(e) => setDiscount(unformatIDR(e.target.value))}
                  placeholder="Masukkan diskon"
                />
              </div>
              <div>
                <Label className="text-sm">Sub Total</Label>
                <Input
                  type="text"
                  value={formatIDR(subtotal)}
                  readOnly
                  className="bg-gray-100"
                />
              </div>
              <div>
                <Label className="text-sm">Sub Total Setelah Diskon</Label>
                <Input
                  type="text"
                  value={formatIDR(subtotalDiscount)}
                  readOnly
                  className="bg-gray-100"
                />
              </div>
            </div>

            {/* Add to Cart Button */}
            <Button
              type="button"
              className="w-full mt-4"
              onClick={addToCart}
              disabled={!selectedService || !amount || !price}
            >
              Tambah ke Keranjang
            </Button>

            {/* Cart Table */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Keranjang</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Jasa
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Jumlah
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Harga
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Subtotal
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Diskon
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Subtotal Setelah Diskon
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {cart.map((item: any) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.service || ""}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          {formatIDR(item.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          {formatIDR(item.price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          {formatIDR(item.subtotal)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          {formatIDR(item.discount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          {formatIDR(item.price * item.amount - item.discount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {cart.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center py-4">
                          <EmptyData text="Keranjang kosong" />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Total Amount */}
            <div className="mt-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-lg">
                      {formatIDR(totalAmount)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payment Details */}
            <div className="flex flex-col gap-2 mt-3">
              <h1 className="text-lg font-bold">Data Pembayaran</h1>
              <div className="grid grid-cols-4 items-center gap-4">
                <div>
                  <Label>Uang Muka</Label>
                  <Input
                    type="text"
                    placeholder="Masukkan uang muka"
                    value={formatIDR(paymentDetails.downPayment || 0)}
                    onChange={(e) =>
                      setPaymentDetails((prev) => ({
                        ...prev,
                        downPayment: unformatIDR(e.target.value),
                      }))
                    }
                  />
                </div>
                <div>
                  <Label>Metode Pembayaran</Label>
                  <Select
                    value={paymentDetails.paymentMethod || ""}
                    onValueChange={(value) =>
                      setPaymentDetails((prev) => ({
                        ...prev,
                        paymentMethod: value,
                      }))
                    }
                    defaultValue={paymentDetails.paymentMethod}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Metode Pembayaran" />
                    </SelectTrigger>
                    <SelectContent>
                      {dataPayment?.map((payment: any) => (
                        <SelectItem key={payment.id} value={payment.id}>
                          {payment.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Sisa Pembayaran</Label>
                  <Input
                    type="text"
                    placeholder="Masukkan sisa pembayaran"
                    value={formatIDR(paymentDetails.remainingPayment || 0)}
                    onChange={(e) =>
                      setPaymentDetails((prev) => ({
                        ...prev,
                        remainingPayment: unformatIDR(e.target.value),
                      }))
                    }
                    readOnly
                  />
                </div>
                <div>
                  <Label>Jatuh Tempo</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="w-4 h-4" />{" "}
                        {paymentDetails.dueDate
                          ? format(paymentDetails.dueDate, "dd MMMM yyyy")
                          : "Pilih Tanggal"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Calendar
                        mode="single"
                        selected={paymentDetails.dueDate}
                        onSelect={(date) =>
                          setPaymentDetails((prev) => ({
                            ...prev,
                            dueDate: date,
                          }))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 mt-6">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Batal
              </Button>
              <Button type="button" onClick={handleSave}>
                Simpan
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </MainPage>
  );
}
