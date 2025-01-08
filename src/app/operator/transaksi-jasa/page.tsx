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
  Command,
  CommandEmpty,
  CommandList,
  CommandGroup,
  CommandItem,
  CommandInput,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  CalendarIcon,
  Check,
  ChevronsUpDown,
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
import { redirect } from "next/navigation";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { format } from "date-fns";
import EmptyData from "@/components/views/empty-data";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TableHead, TableHeader, TableRow, Table, TableBody, TableCell } from "@/components/ui/table";


export default function TransaksiJasa() {
  const [buyer, setBuyer] = useState({
    name: "",
    address: "",
  });

  const [open, setOpen] = useState(false);
  const { user } = useUserStore();
  const [dataService, setDataService] = useState([]);
  const [dataPayment, setDataPayment] = useState([]);
  const [dataBuyer, setDataBuyer] = useState([]);

  // Current Item States with proper initialization
  const [selectedService, setSelectedService] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);
  const [subtotal, setSubtotal] = useState(0);

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

  const handleBuyerSelect = (buyer: any) => {
    setBuyer(buyer);
    setOpen(false);
  }

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
      } else {
        redirect("/operator/service");
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      setDataService([]);
    }
  };

  const fetchDataBuyer = async () => {
    try {
      const response = await fetch("/api/buyer?limit=1000&page=1&factory_id=" + user?.factory_selected?.id);
      const data = await response.json();
      setDataBuyer(data.data);
    } catch (error) {
      console.error("Error fetching buyer:", error);
      setDataBuyer([]);
    }
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
      fetchDataService();
      fetchDataPayment();
      fetchDataBuyer();
    }
  }, [user?.factory_selected?.id]);

  const handleServiceSelect = (service: any) => {
    if (service && typeof service === "object") {
      setSelectedService(service);
      setOpen(false);
    }
  };

  const handleQuantityChange = (e: any) => {
    const rawValue = unformatIDR(e.target.value);
    setQuantity(Math.max(1, rawValue));
  };

  const handlePriceChange = (e: any) => {
    const rawValue = unformatIDR(e.target.value);
    setPrice(rawValue);
  };

  useEffect(() => {
    setSubtotal(quantity * price);
  }, [quantity, price]);

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
    if (!selectedService || !selectedService.id || !quantity || !price) {
      alert("Please fill in all service details");
      return;
    }

    const newItem: any = {
      id: Date.now(),
      service: selectedService,
      quantity,
      price,
      subtotal: quantity * price,
    };

    setCart((prev) => [...prev, newItem]);

    // Reset form
    setSelectedService(null);
    setQuantity(1);
    setPrice(0);
    setSubtotal(0);
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
  
  // sisa pembayaran otomatis dihitung dari total amount dikurangi down payment
  useEffect(() => {
    setPaymentDetails((prev) => ({
      ...prev,
      remainingPayment: totalAmount - (prev.downPayment || 0),
    }));
  }, [totalAmount, paymentDetails.downPayment]);

  return (
    <MainPage>
      <Card>
        <CardHeader>
          <CardTitle>Tambah Transaksi Jasa</CardTitle>
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
                value={buyer.name}
                onChange={(e) =>
                  setBuyer((prev) => ({
                    ...prev,
                    name: e.target.value || "",
                  }))
                }
              />
              {/* buatkan dialog untuk pilih buyer */}
              <Dialog>
                <DialogTrigger asChild>
                  <div className="flex items-center border p-3 rounded-md cursor-pointer">
                    <SearchCheckIcon className="w-4 h-4" />
                  </div>
                </DialogTrigger>
                <DialogContent>
                  <DialogTitle>Pilih Pembeli</DialogTitle>
                  <DialogDescription>
                    Pilih pembeli dari list pembeli
                    <div className="flex items-center gap-2 mt-3">
                      <Input type="text" placeholder="Cari Pembeli" />
                      <Button type="button">Cari</Button>
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
                        {
                          dataBuyer?.map((buyer: any) => (
                            <TableRow key={buyer.id}>
                              <TableCell>{buyer.name}</TableCell>
                              <TableCell>{buyer.address}</TableCell>
                              <TableCell>
                                <Button size="sm" onClick={() => handleBuyerSelect(buyer)}>Pilih</Button>
                              </TableCell>
                            </TableRow>
                          ))
                        }
                      </TableBody>
                    </Table>
                  </DialogDescription>
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

          {/* Service Selection */}
          <div className="grid grid-cols-2 items-center mt-2 gap-4">
            <div>
              <Label className="text-sm">Jenis Jasa</Label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-between"
                  >
                    {selectedService?.name || "Pilih Jenis Jasa"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Cari Jenis Jasa" />
                    <CommandList>
                      <CommandEmpty>Tidak ada jasa ditemukan</CommandEmpty>
                      <CommandGroup>
                        <ScrollArea className="h-[200px]">
                          {dataService?.map((service: any) => (
                            <CommandItem
                              key={service.id}
                              onSelect={() => handleServiceSelect(service)}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  selectedService?.id === service.id
                                    ? "opacity-100"
                                    : "opacity-0"
                                }`}
                              />
                              {service.name}
                            </CommandItem>
                          ))}
                        </ScrollArea>
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Quantity and Price Inputs */}
            <div>
              <Label className="text-sm">Jumlah</Label>
              <Input
                type="text"
                value={formatIDR(quantity)}
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
              <Label className="text-sm">Subtotal</Label>
              <Input
                type="text"
                value={formatIDR(subtotal)}
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
            disabled={!selectedService || !quantity || !price}
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
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cart.map((item: any) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.service?.name || ""}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {formatIDR(item.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {formatIDR(item.subtotal)}
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
                      <td colSpan={5} className="text-center py-4">
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
                <Input type="text" placeholder="Masukkan uang muka" value={formatIDR(paymentDetails.downPayment)} onChange={(e) => setPaymentDetails((prev) => ({
                  ...prev,
                  downPayment: unformatIDR(e.target.value)
                }))} />
              </div>
              <div>
                <Label>Jenis Pembayaran</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Jenis Pembayaran" />
                  </SelectTrigger>
                  <SelectContent>
                    {
                      dataPayment?.map((payment: any) => (
                        <SelectItem key={payment.id} value={payment.id}>{payment.name}</SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Sisa Pembayaran</Label>
                <Input type="text" placeholder="Masukkan sisa pembayaran" value={formatIDR(paymentDetails.remainingPayment)} readOnly />
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
            <Button type="button" variant="outline">
              Batal
            </Button>
            <Button type="button">Simpan</Button>
          </div>
        </CardContent>
      </Card>
    </MainPage>
  );
}
