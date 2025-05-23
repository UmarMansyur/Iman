/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

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
import { useState } from "react";
import { toast } from "react-hot-toast";
import { Truck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MapPin, Calendar1, Package, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function DeliveryStatusDialog({ invoice, fetchData }: any) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(
    invoice.deliveryTracking[0]?.status || "Process"
  );
  const [desc, setDesc] = useState(invoice.deliveryTracking[0]?.desc || "");
  const [location, setLocation] = useState(
    invoice.deliveryTracking[0]?.location || ""
  );

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/invoice/${invoice.id}/delivery-status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
            desc,
            location,
          }),
        }
      );

      if (!response.ok) throw new Error("Gagal mengubah status");

      toast.success("Status pengiriman berhasil diubah");
      fetchData();
      setOpen(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    Process: "bg-yellow-500",
    Done: "bg-green-500",
    Cancel: "bg-red-500",
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full justify-start px-2">
          <Truck className="w-4 h-4 mr-1" /> Ubah Status Pengiriman
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Status Pengiriman
          </DialogTitle>
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
                  <span>Alamat Pengiriman</span>
                </div>
                <p className="font-medium">{invoice.buyer_address}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center text-muted-foreground">
                  <Calendar1 className="w-4 h-4 mr-1" />
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
                  variant="secondary"
                  className={statusColors[status as keyof typeof statusColors]}
                >
                  {status === "Process"
                    ? "Proses"
                    : status === "Done"
                    ? "Selesai"
                    : "Batal"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator className="my-4" />

        <ScrollArea className="space-y-4 max-h-[400px]">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Jatuh Tempo</Label>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Status Pengiriman</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Process">Proses</SelectItem>
                  <SelectItem value="Done">Selesai</SelectItem>
                  <SelectItem value="Cancel">Batal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Deskripsi</Label>
              <Textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Contoh: Paket sedang dalam perjalanan menuju alamat tujuan"
                disabled
                className="min-h-[100px] p-3 rounded-md border border-input"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Lokasi</Label>
              <Input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Contoh: Gudang Pengiriman Jakarta Pusat"
                disabled
                className="p-2 rounded-md border border-input"
              />
            </div>
          </div>
        </ScrollArea>

        <div className="mt-4">
          <Button onClick={handleSubmit} disabled={loading} className="w-full">
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
