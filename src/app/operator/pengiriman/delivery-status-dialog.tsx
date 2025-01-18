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
import StatusDelivery from "@/components/StatusDelivery";

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

  const [desc, setDesc] = useState(invoice?.deliveryTracking[0]?.desc || "Paket sedang dalam perjalanan menuju alamat tujuan");

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
          variant="default"
          size="sm"
          className="justify-center"
        >
          <Truck className="w-4 h-4" />
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center text-muted-foreground">
                      <User className="w-4 h-4 mr-1" />
                      <span className="text-sm">Distributor</span>
                    </div>
                    <p className="font-medium">{invoice?.buyer.name}</p>
                  </div>
                  <div>
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="text-sm">Alamat Pembeli</span>
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
                  <br />
                  <StatusDelivery status={status} />
                </div>
                <div className="flex flex-col justify-between">
                  <p className="text-sm text-muted-foreground">Alamat Pengiriman</p>
                  <p className="font-medium">{invoice?.deliveryTracking[0]?.location.name}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-4">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">
                Informasi Pengiriman & Jatuh Tempo
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
                      <span className="text-sm text-muted-foreground">{date
                        ? date.toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : "Tanggal Jatuh Tempo"}</span>
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
