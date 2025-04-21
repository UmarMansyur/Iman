/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import MainPage from "@/components/main";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { Trash2, RotateCcw, ArrowLeft, Save, Loader2, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useUserStore } from "@/store/user-store";

interface DetailOrder {
  material_unit_id: string;
  amount: number;
  price: number;
  total: number;
}

const formatNumber = (value: string | number): string => {
  if (!value) return '';
  const stringValue = value.toString();
  const parts = stringValue.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return parts.length > 1 ? `${parts[0]},${parts[1]}` : parts[0];
};

const parseFormattedNumber = (value: string): number => {
  if (!value) return 0;
  const normalizedValue = value.replace(/\./g, '').replace(',', '.');
  return parseFloat(normalizedValue) || 0;
};

export default function OrderPage() {
  const router = useRouter();

  const [details, setDetails] = useState<DetailOrder[]>([]);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentMaterial, setCurrentMaterial] = useState('');
  const [currentAmount, setCurrentAmount] = useState<string>('');
  const [currentPrice, setCurrentPrice] = useState<string>('');
  const [currentTotal, setCurrentTotal] = useState<string>('');

  const calculateTotal = (amount: string, price: string) => {
    const numAmount = parseFormattedNumber(amount || "0");
    const numPrice = parseFormattedNumber(price || "0");
    return numAmount * numPrice;
  };

  const handleAmountChange = (value: string) => {
    if (/^[\d.,]*$/.test(value)) {
      const normalizedValue = value.replace(/\./g, '').replace(',', '.');
      const formattedValue = formatNumber(normalizedValue);
      setCurrentAmount(formattedValue);
    }
  };

  const handlePriceChange = (value: string) => {
    if (/^[\d.,]*$/.test(value)) {
      const normalizedValue = value.replace(/\./g, '').replace(',', '.');
      const formattedValue = formatNumber(normalizedValue);
      setCurrentPrice(formattedValue);
    }
  };
  
  useEffect(() => {
    const total = calculateTotal(currentAmount, currentPrice);
    setCurrentTotal(formatNumber(total));
  }, [currentAmount, currentPrice]);

  const addDetail = () => {
    if (!currentMaterial) {
      toast.error('Pilih material terlebih dahulu');
      return;
    }


    const existingDetail = details.find(detail => detail.material_unit_id === currentMaterial);
    if (existingDetail) {
      toast.error('Material sudah ada dalam detail order, edit jumlah atau harga');
      return;
    }

    const amount = parseFormattedNumber(currentAmount);
    const price = parseFormattedNumber(currentPrice);
    const total = amount * price;

    setDetails([...details, { 
      material_unit_id: currentMaterial, 
      amount,
      price,
      total
    }]);

    setCurrentMaterial('');
    setCurrentAmount('');
    setCurrentPrice('');
    setCurrentTotal('');
  };

  const [materials, setMaterials] = useState<any[]>([]);
  const { user } = useUserStore();
  useEffect(() => {
    const fetchMaterials = async () => {
      const response = await fetch("/api/material-unit?limit=1000&page=1&factory_id=" + user?.factory_selected?.id);
      const data = await response.json();
      setMaterials(data.data);
    };
    fetchMaterials();
  }, [user?.factory_selected?.id]);

  const removeDetail = (index: number) => {
    const newDetails = details.filter((_, i) => i !== index);
    setDetails(newDetails);
  };

  const grandTotal = details.reduce((sum, detail) => sum + detail.total, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        factory_id: user?.factory_selected?.id,
        desc: description,
        user_id: user?.id,
        type_preorder: true,
        details: details.map(detail => ({
          material_unit_id: detail.material_unit_id,
          amount: detail.amount,
          price: detail.price,
        }))
      };

      const response = await fetch('/api/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setDetails([]);
      toast.success('Order berhasil dibuat');
      router.push("/operator/persediaan-bahan-baku");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setDetails([]);
    setDescription('');
  };

  return (
    <MainPage>
      <div className="container mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Tambah Data Order</h3>
                <Button 
                  type="button" 
                  className="bg-gray-400 hover:bg-gray-500 text-white shadow-sm shadow-gray-400/50"
                  onClick={() => router.push('/operator/persediaan-bahan-baku')}
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Kembali
                </Button>
              </div>
            </CardTitle>
            <CardDescription>
              <p>
                Tambah data order persediaan bahan baku, pastikan data yang sudah diinputkan telah benar. Form inputan tidak dapat diedit dan dihapus setelah order dibuat. Alternatifnya silahkan hubungi owner untuk mengubah data.
              </p>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-2">
                <label>Deskripsi:</label>
                <Textarea 
                  placeholder="Masukkan deskripsi order bahan baku" 
                  rows={4} 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  aria-invalid={!description}
                />
              </div>

              <div className="grid grid-cols-5 gap-4 items-end">
                <div className="grid gap-2">
                  <label>Material</label>
                  <Select 
                    value={currentMaterial}
                    onValueChange={setCurrentMaterial}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Material">
                        {materials.find(m => m.id == currentMaterial)?.material}
                        {materials.find(m => m.id == currentMaterial) ? ' / ' : ''}
                        {materials.find(m => m.id == currentMaterial)?.unit}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {materials.map((material) => (
                        <SelectItem key={material.id} value={material.id}>
                          {material.material} / {material.unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <label>Jumlah</label>
                  <Input 
                    type="text"
                    value={currentAmount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    placeholder="Jumlah"
                  />
                </div>
                <div className="grid gap-2">
                  <label>Harga</label>
                  <Input 
                    type="text"
                    value={currentPrice}
                    onChange={(e) => handlePriceChange(e.target.value)}
                    placeholder="Harga per unit"
                  />
                </div>
                <div className="grid gap-2">
                  <label>Total</label>
                  <Input 
                    type="text"
                    className="bg-gray-50 text-black text-lg font-semibold text-end"
                    value={currentTotal}
                    disabled
                  />
                </div>
                <Button 
                  type="button"
                  onClick={addDetail}
                  className="bg-danger2 hover:bg-danger2/80 hover:shadow-danger2/60 hover:text-white"
                >
                  <ShoppingCart className="w-4 h-4 mr-1" />
                  Tambah
                </Button>
              </div>

              <h1 className="text-lg font-semibold">Detail Order</h1>
              <div className="border rounded-lg">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left">Material</th>
                      <th className="px-4 py-2 text-left">Jumlah</th>
                      <th className="px-4 py-2 text-left">Harga</th>
                      <th className="px-4 py-2 text-left">Total</th>
                      <th className="px-4 py-2 text-left">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {details.map((detail, index) => (
                      <tr key={index} className="border-t">
                        <td className="px-4 py-2">
                          {materials.find(m => m.id == detail.material_unit_id)?.material} / 
                          {materials.find(m => m.id == detail.material_unit_id)?.unit}
                        </td>
                        <td className="px-4 py-2">{formatNumber(detail.amount)}</td>
                        <td className="px-4 py-2">Rp {formatNumber(detail.price)}</td>
                        <td className="px-4 py-2">Rp {formatNumber(detail.total)}</td>
                        <td className="px-4 py-2">
                          <Button 
                            type="button"
                            variant="destructive"
                            onClick={() => removeDetail(index)}
                            size="sm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {!details.length && (
                      <tr>
                        <td colSpan={5} className="text-center py-10">Tidak ada data</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center border p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-medium">Total Keseluruhan</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-lg font-medium">Rp</span>
                  <span className="font-bold text-4xl tracking-tight">
                    {formatNumber(grandTotal)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between">
                <div className="space-x-2">
                  <Button 
                    type="button" 
                    className="bg-white border border-gray-300 hover:bg-gray-100 text-black"
                    onClick={handleReset}
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Reset
                  </Button>
                </div>
                <Button 
                  type="submit" 
                  className="bg-blue-500 hover:bg-blue-600"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 mr-1" />
                  ) : (
                    <Save className="w-4 h-4 mr-1" />
                  )}
                  {isSubmitting ? 'Sedang menyimpan...' : 'Simpan Order'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainPage>
  );
}