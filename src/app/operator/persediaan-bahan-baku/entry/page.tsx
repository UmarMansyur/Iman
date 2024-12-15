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
}

export default function OrderPage() {
  const [details, setDetails] = useState<DetailOrder[]>([]);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  const [currentMaterial, setCurrentMaterial] = useState('');
  const [currentAmount, setCurrentAmount] = useState<string>('');

  const formatNumber = (value: string) => {
    const number = value.replace(/\D/g, '');
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const addDetail = () => {
    if (!currentMaterial) {
      toast.error('Pilih material terlebih dahulu');
      return;
    }
    if (!currentAmount || Number(currentAmount) <= 0) {
      toast.error('Jumlah harus lebih dari 0');
      return;
    }


    const existingDetail = details.find(detail => detail.material_unit_id === currentMaterial);
    if (existingDetail) {
      toast.error('Material sudah ada dalam detail order, edit jumlah atau harga');
      return;
    }
    setDetails([...details, { 
      material_unit_id: currentMaterial, 
      amount: Number(currentAmount.replace(/,/g, '')), 
    }]);

    setCurrentMaterial('');
    setCurrentAmount('');
  };


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


  const { user } = useUserStore()
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        factory_id: 1, // Adjust based on your needs
        desc: description,
        user_id: user?.id,
        price: 0,
        type_preorder: false,
        details: details.map(detail => ({
          material_unit_id: detail.material_unit_id,
          amount: detail.amount,
          price: 0,
        }))
      };

      const response = await fetch('/api/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json()
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

  return(
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
                  <ArrowLeft className="w-4 h-4 mr-2" />
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
                  // error jika tidak diisi
                  aria-invalid={!description}
                />
              </div>

              <div className="grid grid-cols-3 gap-4 items-end">
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
                    onChange={(e) => {
                      const value = e.target.value.replace(/,/g, '');
                      if (/^\d*$/.test(value) || value === '') {
                        setCurrentAmount(formatNumber(value));
                      }
                    }}
                    placeholder="Jumlah"
                  />
                </div>
                <Button 
                  type="button"
                  onClick={addDetail}
                  className="bg-danger2 hover:bg-danger2/80 hover:shadow-danger2/60 hover:text-white"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
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
                    </tr>
                  </thead>
                  <tbody>
                    {details.map((detail, index) => (
                      <tr key={index} className="border-t">
                        <td className="px-4 py-2">
                          {materials.find(m => m.id == detail.material_unit_id)?.material} / 
                          {materials.find(m => m.id == detail.material_unit_id)?.unit}
                        </td>
                        <td className="px-4 py-2">{formatNumber(detail.amount.toString())}</td>
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
                  {
                    isSubmitting ? (
                      <Loader2 className="w-4 h-4 mr-2" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )
                  }
                  {isSubmitting ? 'Sedang menyimpan...' : 'Simpan Order'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainPage>
  )
}