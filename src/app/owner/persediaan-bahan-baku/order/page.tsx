/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import MainPage from "@/components/main";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { Plus, Trash2, RotateCcw, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

interface DetailOrder {
  material_unit_id: string;
  amount: number;
  price: number;
  total: number;
}

export default function OrderPage() {
  const [details, setDetails] = useState<DetailOrder[]>([]);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  const [currentMaterial, setCurrentMaterial] = useState('');
  const [currentAmount, setCurrentAmount] = useState<number>(0);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [currentTotal, setCurrentTotal] = useState<number>(0);

  const addDetail = () => {
    if (!currentMaterial) {
      toast.error('Pilih material terlebih dahulu');
      return;
    }
    if (!currentAmount || currentAmount <= 0) {
      toast.error('Jumlah harus lebih dari 0');
      return;
    }
    if (!currentPrice || currentPrice <= 0) {
      toast.error('Harga harus lebih dari 0');
      return;
    }

    setDetails([...details, { 
      material_unit_id: currentMaterial, 
      amount: currentAmount, 
      price: currentPrice,
      total: currentAmount * currentPrice 
    }]);

    setCurrentMaterial('');
    setCurrentAmount(0);
    setCurrentPrice(0);
    setCurrentTotal(0);
  };

  useEffect(() => {
    setCurrentTotal(currentAmount * currentPrice);
  }, [currentAmount, currentPrice]);

  const [materials, setMaterials] = useState<any[]>([]);
  useEffect(() => {
    const fetchMaterials = async () => {
      const response = await fetch("/api/material-unit?limit=1000");
      const data = await response.json();
      setMaterials(data.data);
    };
    fetchMaterials();
  }, []);

  const removeDetail = (index: number) => {
    const newDetails = details.filter((_, i) => i !== index);
    setDetails(newDetails);
  };

  const handleDetailChange = (index: number, field: keyof DetailOrder, value: string | number) => {
    const newDetails = details.map((detail, i) => {
      if (i === index) {
        const updatedDetail = { ...detail, [field]: value };
        if (field === 'amount' || field === 'price') {
          updatedDetail.total = updatedDetail.amount * updatedDetail.price;
        }
        return updatedDetail;
      }
      return detail;
    });
    setDetails(newDetails);
  };

  const grandTotal = details.reduce((sum, detail) => sum + detail.total, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        factory_id: 1, // Adjust based on your needs
        desc: description,
        details: details.map(detail => ({
          material_unit_id: detail.material_unit_id,
          amount: detail.amount,
          price: detail.price
        }))
      };

      const response = await fetch('/api/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to create order');

      toast.success('Order berhasil dibuat');
      router.push("/owner/persediaan-bahan-baku/order"); // Adjust the route as needed
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

  return(
    <MainPage>
      <div className="container">
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Tambah Data Order</h3>
                <Button 
                  type="button" 
                  className="bg-white border border-gray-300 hover:bg-gray-100 text-black"
                  onClick={() => router.back()}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Kembali
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-2">
                <label>Deskripsi</label>
                <Textarea 
                  placeholder="Masukkan deskripsi order" 
                  rows={4} 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
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
                    type="number"
                    value={currentAmount || ''}
                    onChange={(e) => setCurrentAmount(Number(e.target.value))}
                    placeholder="Jumlah"
                  />
                </div>
                <div className="grid gap-2">
                  <label>Harga</label>
                  <Input 
                    type="number"
                    value={currentPrice || ''}
                    onChange={(e) => setCurrentPrice(Number(e.target.value))}
                    placeholder="Harga per unit"
                  />
                </div>
                <div className="grid gap-2">
                  <label>Total</label>
                  <Input 
                    type="number"
                    value={currentTotal || ''}
                    disabled
                  />
                </div>
                <Button 
                  type="button"
                  onClick={addDetail}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah
                </Button>
              </div>

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
                        <td className="px-4 py-2">{detail.amount}</td>
                        <td className="px-4 py-2">Rp {detail.price.toLocaleString('id-ID')}</td>
                        <td className="px-4 py-2">Rp {detail.total.toLocaleString('id-ID')}</td>
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
                    {
                      !details.length && (
                        <tr>
                          <td colSpan={5} className="text-center py-10">Tidak ada data</td>
                        </tr>
                      )
                    }
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
                    {grandTotal.toLocaleString('id-ID')}
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
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                </div>
                <Button 
                  type="submit" 
                  className="bg-blue-500 hover:bg-blue-600"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Order'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainPage>
  )
}
