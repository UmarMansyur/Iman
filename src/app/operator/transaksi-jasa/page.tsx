/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateTransactionService, useServices, useBuyers } from "@/hooks/use-transaction-service";
import { useUserStore } from "@/store/user-store";
import { toast } from "react-hot-toast";
import { useRouter } from "next/router";

export default function CreateTransactionService() {
  const router = useRouter();
  const { user } = useUserStore();
  const [buyerId, setBuyerId] = useState<string>("");
  const [services, setServices] = useState<any[]>([]);
  const [desc, setDesc] = useState("");
  const [downPayment, setDownPayment] = useState(0);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);

  const { data: servicesData } = useServices(Number(user?.factory_selected?.id) || 0);
  const { data: buyersData } = useBuyers(Number(user?.factory_selected?.id) || 0);
  const createTransaction = useCreateTransactionService();

  const totalAmount = services.reduce((acc: number, service: any) => {
    return acc + (service.price * service.amount);
  }, 0);

  const handleAddService = () => {
    if (!selectedService) {
      toast.error("Pilih jasa terlebih dahulu");
      return;
    }

    const serviceToAdd = {
      service_id: selectedService.id,
      desc: selectedService.name,
      amount: quantity,
      price: selectedService.price,
    };

    setServices([...services, serviceToAdd]);
    setSelectedService(null);
    setQuantity(1);
  };

  const handleSubmit = async () => {
    if (!buyerId) {
      toast.error("Pilih pembeli terlebih dahulu");
      return;
    }

    if (services.length === 0) {
      toast.error("Tambahkan minimal satu jasa");
      return;
    }

    try {
      await createTransaction.mutateAsync({
        buyer_id: parseInt(buyerId),
        services,
        desc,
        amount: totalAmount,
        down_payment: downPayment,
        user_id: user?.id,
      });

      toast.success("Transaksi berhasil dibuat");
      router.push("/transaksi-jasa");
    } catch (error: any) {
      toast.error(error.response.data.message);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Buat Transaksi Jasa</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label>Pembeli</Label>
            <Select onValueChange={setBuyerId}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Pembeli" />
              </SelectTrigger>
              <SelectContent>
                {buyersData?.map((buyer: any) => (
                  <SelectItem key={buyer.id} value={String(buyer.id)}>
                    {buyer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Jasa</Label>
              <Select 
                onValueChange={(value) => {
                  const service = servicesData?.find((s: any) => s.id === parseInt(value));
                  setSelectedService(service);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Jasa" />
                </SelectTrigger>
                <SelectContent>
                  {servicesData?.map((service: any) => (
                    <SelectItem key={service.id} value={String(service.id)}>
                      {service.name} - Rp {service.price.toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Jumlah</Label>
              <Input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
              />
            </div>

            <Button onClick={handleAddService}>Tambah Jasa</Button>
          </div>

          {/* Daftar Jasa yang dipilih */}
          <div className="space-y-2">
            <Label>Jasa yang dipilih:</Label>
            {services.map((service, index) => (
              <div key={index} className="flex justify-between items-center p-2 border rounded">
                <div>
                  {service.desc} x {service.amount}
                </div>
                <div>
                  Rp {(service.price * service.amount).toLocaleString()}
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    const newServices = services.filter((_, i) => i !== index);
                    setServices(newServices);
                  }}
                >
                  Hapus
                </Button>
              </div>
            ))}
          </div>

          <div>
            <Label>Keterangan</Label>
            <Input
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Masukkan keterangan transaksi"
            />
          </div>

          <div>
            <Label>Uang Muka</Label>
            <Input
              type="number"
              value={downPayment}
              onChange={(e) => setDownPayment(parseInt(e.target.value))}
              placeholder="Masukkan jumlah uang muka"
            />
          </div>

          <div className="p-4 bg-primary text-primary-foreground rounded">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total</span>
                <span>Rp {totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Uang Muka</span>
                <span>Rp {downPayment.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Sisa Pembayaran</span>
                <span>Rp {(totalAmount - downPayment).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={() => router.back()}>
              Batal
            </Button>
            <Button onClick={handleSubmit}>
              Simpan Transaksi
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}