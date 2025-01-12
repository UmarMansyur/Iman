/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { useState } from "react";
import { toast } from "react-hot-toast";
import { Truck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MapPin, Calendar, Package, Clock } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useUserStore } from "@/store/user-store";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function DeliveryStatusDialog({ invoice }: any) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    status: invoice.status_delivery || "Process",
    desc: invoice.desc_delivery || "",
    location: invoice.buyer_address || "",
  });

  const { user } = useUserStore();

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => handleChangeStatus(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transaksi-distributor"] });
    },
  });

  const handleChangeStatus = async () => {
    if (!user?.factory_selected?.id) {
      toast.error("Gagal mengubah status, pilih gudang terlebih dahulu");
      return;
    }
    try {
      const response = await fetch(`/api/distributor/pengiriman`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: invoice.id,
          status_delivery: formData.status,
        }),
      });
      const res = await response.json();
      if (!response.ok) throw new Error(res.message);
      toast.success(res.message);
      setOpen(false);
      return res;
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await mutation.mutateAsync();
      setOpen(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full justify-start py-0 px-2 ">
          <Truck className="w-4 h-4" /> Ubah Status Pengiriman
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Status Pengiriman
          </DialogTitle>
          <DialogDescription>
            Anda dapat mengubah status pengiriman dengan memilih status pengiriman yang tersedia dibawah ini.
          </DialogDescription>
        </DialogHeader>

        <Card className="mb-4">
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center text-muted-foreground">
                  <Package className="w-4 h-4 mr-1" />
                  <span>Nomor Invoice</span>
                </div>
                <p className="font-medium">{invoice.invoice_code}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>Alamat Pembeli</span>
                </div>
                <p className="font-medium">{invoice.buyer?.address}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>Tanggal Pesanan</span>
                </div>
                <p className="font-medium">
                  {new Date(invoice.created_at).toLocaleDateString("id-ID")}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center text-muted-foreground">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>Status Saat Ini</span>
                </div>
                <Badge
                  variant="outline"
                  className={`bg-gray-100 text-gray-800 hover:bg-gray-100/80 dark:bg-gray-800 dark:text-gray-300 border-0`}
                >
                  {invoice.status_delivery}
                </Badge>
              </div>
              <div>
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>Lokasi Pengiriman</span>
                </div>
                <p className="font-medium">
                  {invoice.location_distributor?.name}
                </p>
              </div>
              <div>
                <div className="flex items-center text-muted-foreground">
                  <Truck className="w-4 h-4 mr-1" />
                  <span>Biaya Pengiriman</span>
                </div>
                <p className="font-medium">
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                  })
                    .format(invoice.cost_delivery)
                    .slice(0, -3)}
                </p>
              </div>
            </div>
            <Separator className="my-4" />
            <ScrollArea className="space-y-4 max-h-[400px]">
              <div className="space-y-4 px-1">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Status Pengiriman
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleChange("status", value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Process">Proses</SelectItem>
                      <SelectItem value="Sent">Dikirim</SelectItem>
                      <SelectItem value="Done">Selesai</SelectItem>
                      <SelectItem value="Cancel">Batal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Catatan: </Label>
                  <Textarea
                    value={formData.desc}
                    onChange={(e) => handleChange("desc", e.target.value)}
                    disabled
                    className="min-h-[100px] p-3 rounded-md border border-input"
                  />
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <div className="mt-4">
          <Button onClick={handleSubmit} disabled={loading} className="w-full">
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
