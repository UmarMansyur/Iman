/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";
import {
  Truck,
  ArrowRight,
  MapPin,
  Calendar,
  Building,
  CreditCard,
  FileText,
  User,
  CalendarIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar as ShadcnCalendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { UseBaseMutationResult, useMutation, useQueryClient } from "@tanstack/react-query";

export default function DeliveryStatusDialog({
  invoice,
}: {
  invoice: any;
}) {
  const [open, setOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  const [status] = useState(
    invoice?.deliveryTracking[0]?.status || "Process"
  );

  const [selectStatus, setSelectStatus] = useState("");

  const [sales_name, setSalesName] = useState(
    invoice?.deliveryTracking[0]?.sales_man || ""
  );

  const [desc, setDesc] = useState(invoice?.deliveryTracking[0]?.desc || "");

  const [recipient, setRecipient] = useState(
    invoice?.deliveryTracking[0]?.recipient || ""
  );

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/invoice/${invoice?.id}/delivery-status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: selectStatus,
            sales_name,
            recipient,
            desc,
            maturity_date: date,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      toast.success("Status pengiriman berhasil diubah");
      setOpen(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };


  const useHandleSubmit = (): UseBaseMutationResult => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: () => handleSubmit(),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["transactions"] });
      },
    })
  }

  const { mutate } = useHandleSubmit();



  const statusColors = {
    Process: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    Sent: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    Done: "bg-green-500/10 text-green-500 border-green-500/20",
    Cancel: "bg-red-500/10 text-red-500 border-red-500/20",
  };

  const statusText = {
    Process: "Sedang Diproses",
    Sent: "Sedang Dikirim",
    Done: "Pengiriman Selesai",
    Cancel: "Pengiriman Dibatalkan",
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

  const [date, setDate] = useState(
    invoice?.maturity_date ? new Date(invoice?.maturity_date) : undefined
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-start px-2 hover:bg-secondary"
        >
          <Truck className="w-4 h-4 mr-1" />
          Ubah Status Pengiriman
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <ScrollArea className="max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Truck className="w-6 h-6" />
              Status Pengiriman
            </DialogTitle>
            <p className="text-muted-foreground">
              Kelola dan perbarui status pengiriman untuk pesanan ini
            </p>
          </DialogHeader>

          <div className="grid grid-cols-3 gap-4">
            <Card className="col-span-2">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">
                  Informasi Pengiriman
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-muted-foreground">
                      <FileText className="w-4 h-4 mr-1" />
                      <span className="text-sm">Nomor Invoice</span>
                    </div>
                    <p className="font-medium">{invoice?.invoice_code}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span className="text-sm">Tanggal Pesanan</span>
                    </div>
                    <p className="font-medium">
                      {new Date(invoice?.created_at).toLocaleDateString(
                        "id-ID",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }
                      )}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-muted-foreground">
                      <User className="w-4 h-4 mr-1" />
                      <span className="text-sm">Distributor</span>
                    </div>
                    <p className="font-medium">{invoice?.buyer.name}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="text-sm">Alamat Pengiriman</span>
                    </div>
                    <p className="font-medium">{invoice?.buyer.address}</p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-muted-foreground">
                      <Building className="w-4 h-4 mr-1" />
                      <span className="text-sm">Pabrik</span>
                    </div>
                    <p className="font-medium">{invoice?.factory.name}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-muted-foreground">
                      <CreditCard className="w-4 h-4 mr-1" />
                      <span className="text-sm">Metode Pembayaran</span>
                    </div>
                    <p className="font-medium">
                      {invoice?.payment_method.name}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">
                  Ringkasan Pesanan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground">
                    Total Pesanan
                  </span>
                  <p className="text-xl font-semibold">
                    {formatCurrency(invoice?.total)}
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground">
                    Status Saat Ini
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-sm px-3 py-1 ${
                      statusColors[status as keyof typeof statusColors]
                    }`}
                  >
                    {statusText[status as keyof typeof statusText]}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-4">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">
                Perbarui Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date
                        ? date.toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : "Pilih tanggal pengiriman"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <ShadcnCalendar
                      mode="single"
                      selected={date}
                      onSelect={(newDate) => {
                        if (newDate) {
                          setDate(newDate);
                        }
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-3">
                <Label>Status Pengiriman</Label>
                <Select value={selectStatus} onValueChange={setSelectStatus} defaultValue={status}>
                  <SelectTrigger className="w-full h-10">
                    <SelectValue placeholder="Pilih status pengiriman" />
                  </SelectTrigger>
                  <SelectContent>
                    {status === "Process" && (
                      <SelectItem value="Process">Sedang Diproses</SelectItem>
                    )}
                    <SelectItem value="Sent">Sedang Dikirim</SelectItem>
                    <SelectItem value="Done">Pengiriman Selesai</SelectItem>
                    <SelectItem value="Cancel">
                      Pengiriman Dibatalkan
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectStatus === "Sent" && (
                <div className="space-y-3">
                  <Label>Nama Pengirim</Label>
                  <Input
                    value={sales_name}
                    onChange={(e) => setSalesName(e.target.value)}
                    placeholder="Nama Pengirim"
                  />
                </div>
              )}

              {selectStatus === "Sent" && (
                <div className="space-y-3">
                  <Label>Keterangan</Label>
                  <Textarea
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="Contoh: Paket sedang dalam perjalanan menuju alamat tujuan"
                    className="min-h-[100px] resize-none"
                  />
                </div>
              )}

              {selectStatus === "Done" && (
                <div className="space-y-3">
                  <Label>Nama Penerima</Label>
                  <Input
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="Nama Penerima"
                  />
                </div>
              )}

              {
                selectStatus === "Cancel" && (
                  <div className="space-y-3">
                    <Label>Keterangan Pembatalan</Label>
                    <Textarea
                      value={desc}
                      onChange={(e) => setDesc(e.target.value)}
                      placeholder="Contoh: Pengiriman dibatalkan karena alamat tidak ditemukan"
                      className="min-h-[100px] resize-none"
                    />
                  </div>
                )
              }

              <Button
                onClick={mutate}
                disabled={loading}
                className="w-full h-10"
              >
                {loading ? (
                  "Menyimpan Perubahan..."
                ) : (
                  <>
                    Simpan Perubahan
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
