/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { RadioGroup, RadioGroupItem } from "@/components/email/ui/radio-group";
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
  Search,
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

export default function TransaksiJasa() {
  const [open, setOpen] = useState(false);
  const { user } = useUserStore();
  const [dataService, setDataService] = useState<any>();
  const [dataJasa, setDataJasa] = useState<any>();
  const [jasaSelected, setJasaSelected] = useState<any>();
  const [jumlah, setJumlah] = useState<any>();
  const [harga, setHarga] = useState<any>();
  const [subTotal, setSubTotal] = useState<any>();
  const [totalHarga, setTotalHarga] = useState<any>();
  const [dataPayment, setDataPayment] = useState<any>();

  const [cart, setCart] = useState<any>([]);

  const fetchDataService = async () => {
    const response = await fetch(
      "/api/service?limit=100000&page=1&factory_id=" +
        user?.factory_selected?.id
    );
    const data = await response.json();
    if (data.data.length > 0) {
      setDataService(data.data);
    } else {
      redirect("/operator/service");
    }
  };

  const fetchDataPayment = async () => {
    const response = await fetch('/api/payment?limit=1000&page=1');
    const data = await response.json();
    setDataPayment(data.payments);
  }

  useEffect(() => {
    if (user?.factory_selected?.id) {
      fetchDataService();
      fetchDataPayment();
    }
  }, [user?.factory_selected?.id]);

  return (
    <MainPage>
      <Card>
        <CardHeader>
          <CardTitle> Tambah Transaksi Jasa </CardTitle>
          <CardDescription>
            {" "}
            Isi data transaksi jasa dengan benar{" "}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2 mt-3">
            <Label> Nama Pembeli </Label>
            <div className="flex items-center gap-2">
              <Input type="text" placeholder="Nama Pembeli" />
              <Button>
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-2 mt-3">
            <Label> Alamat Pembeli </Label>
            <div className="flex items-center gap-2">
              <Textarea placeholder="Alamat Pembeli" />
            </div>
          </div>
          <div className="flex flex-col gap-2 mt-3">
            <h1 className="text-lg font-bold"> Data Transaksi </h1>
            <Label> Jenis Transaksi </Label>
            <RadioGroup defaultValue="option-one">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="option-one" id="option-one" />
                <Label htmlFor="option-one">Jasa</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="grid grid-cols-2 items-center mt-2 gap-4">
            <div>
              <Label className="text-sm col-span-4"> Jenis Jasa </Label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild className="col-span-3">
                  <Button
                    variant="ghost"
                    className="bg-white border border-gray-300 text-black w-full text-start justify-between flex items-center gap-2"
                  >
                    Pilih Jenis Jasa
                    <ChevronsUpDown className="opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command
                    className="rounded-lg shadow-md"
                    onValueChange={setJasaSelected}
                    value={jasaSelected}
                  >
                    <CommandInput placeholder="Cari Jenis Jasa" />
                    <CommandList>
                      <CommandEmpty>
                        Tidak ada jenis jasa yang ditemukan.
                      </CommandEmpty>
                      <CommandGroup>
                        <ScrollArea className="h-[200px]">
                          {dataService?.map((item: any) => (
                            <CommandItem key={item.id} value={item.id} onSelect={() => setJasaSelected(item.id)} className="cursor-pointer w-full">
                              {dataJasa == item.id ? (
                                <Check className="w-4 h-4" />
                              ) : (
                                ""
                              )}

                              {item.name}
                            </CommandItem>
                          ))}
                        </ScrollArea>
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label className="text-sm">Jumlah</Label>
              <Input type="number" placeholder="Masukkan jumlah" min={1} />
            </div>
            <div>
              <Label className="text-sm">Harga Satuan</Label>
              <Input
                type="number"
                placeholder="Masukkan harga satuan"
                min={0}
              />
            </div>
            <div>
              <Label className="text-sm">Total Harga</Label>
              <Input
                type="number"
                readOnly
                className="bg-gray-100"
                value={0} // Nanti bisa diupdate dengan perhitungan jumlah * harga
              />
            </div>
          </div>
          <div className="flex flex-col gap-2 mt-3">
            <h1 className="text-lg font-bold">Data Keranjang</h1>
            <div className="flex flex-col">
              <div className="-m-1.5 overflow-x-auto">
                <div className="p-1.5 min-w-full inline-block align-middle">
                  <div className="border rounded-lg overflow-hidden dark:border-neutral-700">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
                      <thead className="bg-gray-50 dark:bg-neutral-700">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-400"
                          >
                            Jasa
                          </th>
                          <th
                            scope="col"
                            className="text-end px-6 py-3 text-xs font-medium text-gray-500 uppercase dark:text-neutral-400"
                          >
                            Jumlah
                          </th>
                          <th
                            scope="col"
                            className="text-end px-6 py-3 text-xs font-medium text-gray-500 uppercase dark:text-neutral-400"
                          >
                            Harga
                          </th>
                          <th
                            scope="col"
                            className="text-end px-6 py-3 text-xs font-medium text-gray-500 uppercase dark:text-neutral-400"
                          >
                            Sub Total
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase dark:text-neutral-400"
                          >
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
                        <tr>
                          <td className="px-6 py-4 text-sm font-medium text-gray-800 dark:text-neutral-200">
                            Jasa 1
                          </td>
                          <td className="px-6 py-4 text-sm text-end text-gray-800 dark:text-neutral-200">
                            1
                          </td>
                          <td className="px-6 py-4 text-sm text-end text-gray-800 dark:text-neutral-200">
                            Rp. 100.000
                          </td>
                          <td className="px-6 py-4 text-end text-sm font-medium">
                            Rp. 100.000
                          </td>
                          <td className="px-6 py-4 text-center text-sm font-medium">
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                            >
                              <Trash className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Card className="p-3 mt-3">
            <div className="flex justify-between items-center">
              <p className="text-lg font-bold">Total Harga</p>
              <p className="text-lg font-bold">Rp. 0</p>
            </div>
          </Card>
          <div className="flex flex-col gap-2 mt-3">
            <h1 className="text-lg font-bold">Data Pembayaran</h1>
            <div className="grid grid-cols-4 items-center gap-4">
              <div>
                <Label>Uang Muka</Label>
                <Input type="number" placeholder="Masukkan uang muka" />
              </div>
              <div>
                <Label>Jenis Pembayaran</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Jenis Pembayaran" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="option-one">Option 1</SelectItem>
                    <SelectItem value="option-two">Option 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Sisa Pembayaran</Label>
                <Input type="number" placeholder="Masukkan sisa pembayaran" />
              </div>
              <div>
                <Label>Jatuh Tempo</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="w-4 h-4" /> Pilih Tanggal
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Calendar />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline">Batal</Button>
            <Button>Simpan Transaksi</Button>
          </div>
        </CardContent>
      </Card>
    </MainPage>
  );
}
