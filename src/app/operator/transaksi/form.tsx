/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Pencil, PlusCircle, Trash2 } from "lucide-react";
import { DialogClose } from "@radix-ui/react-dialog";
import { Select, SelectItem, SelectContent, SelectGroup, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

export default function InvoiceForm({
  invoice,
  fetchData,
}: {
  invoice?: {
    id: number;
    invoice_code: string;
    buyer: string;
    sales_man: string;
    recipient: string;
    buyer_address: string;
    maturity_date: Date;
    // ... other invoice fields
  };
  fetchData: () => Promise<void>;
}) {
  const { toast } = useToast();
  const [isProduct, setIsProduct] = useState(true);
  const [details, setDetails] = useState<Array<{
    unit_id?: number;
    product_id?: number;
    desc: string;
    amount: number;
    discount: number;
    sub_total: number;
  }>>([]);
  
  const handleAddDetail = () => {
    setDetails([...details, {
      ...(isProduct 
        ? { product_id: 0 }
        : { unit_id: 0 }
      ),
      desc: "",
      amount: 0,
      discount: 0,
      sub_total: 0
    }]);
  };

  const handleRemoveDetail = (index: number) => {
    setDetails(details.filter((_, i) => i !== index));
  };

  const handleDetailChange = (index: number, field: string, value: any) => {
    const newDetails = [...details];
    newDetails[index] = { ...newDetails[index], [field]: value };
    
    // Calculate sub_total when amount changes
    if (field === 'amount') {
      newDetails[index].sub_total = value * (1 - (newDetails[index].discount / 100));
    }
    
    setDetails(newDetails);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    
    try {
      const payload = {
        factory_id: 1, // Set appropriate factory_id
        user_id: 1, // Set appropriate user_id
        invoice_code: Math.random().toString(36).substring(7), // Generate invoice code
        buyer: formData.get('buyer'),
        sales_man: formData.get('sales_man'),
        recipient: formData.get('recipient'),
        maturity_date: formData.get('maturity_date'),
        buyer_address: formData.get('buyer_address'),
        payment_method_id: 1, // Set appropriate payment method
        detailInvoices: details.map(detail => ({
          ...detail,
          price: 0, // Set appropriate price
        })),
        // Calculate totals
        item_amount: details.length,
        sub_total: details.reduce((sum, detail) => sum + detail.sub_total, 0),
        total: details.reduce((sum, detail) => sum + detail.sub_total, 0),
        // Other required fields with default values
        amount: 0,
        discount: 0,
        down_payment: 0,
        ppn: 0,
        discon_member: 0,
        remaining_balance: 0,
        payment_status: 'PENDING',
        deliveryTracking: [] // Add delivery tracking if needed
      };

      const response = await fetch('/api/transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.status === 'success') {
        toast({
          title: "Berhasil",
          description: "Transaksi berhasil disimpan",
        });
        fetchData();
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Gagal menyimpan transaksi",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {invoice ? (
          <Button variant="ghost" className="w-full flex justify-start px-2">
            <Pencil className="w-4 h-4 mr-1" />
            Edit
          </Button>
        ) : (
          <Button
            variant="ghost"
            className="bg-blue-500 hover:bg-blue-600 flex justify-end px-4 text-white hover:text-white"
          >
            <PlusCircle className="w-4 h-4" />
            Tambah Transaksi
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{invoice ? "Edit Transaksi" : "Tambah Transaksi"}</DialogTitle>
          <DialogDescription>
            Masukkan detail transaksi untuk {invoice ? "mengubah" : "menambah"} invoice.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Toggle Switch */}
            <div className="flex items-center space-x-2">
              <Switch
                id="invoice-type"
                checked={isProduct}
                onCheckedChange={setIsProduct}
              />
              <Label htmlFor="invoice-type">
                {isProduct ? "Transaksi Produk" : "Transaksi Non-Produk"}
              </Label>
            </div>

            {/* Basic Invoice Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="buyer">Pembeli</Label>
                <Input
                  id="buyer"
                  name="buyer"
                  defaultValue={invoice?.buyer}
                  placeholder="Nama Pembeli"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sales_man">Sales</Label>
                <Input
                  id="sales_man"
                  name="sales_man"
                  defaultValue={invoice?.sales_man}
                  placeholder="Nama Sales"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recipient">Penerima</Label>
                <Input
                  id="recipient"
                  name="recipient"
                  defaultValue={invoice?.recipient}
                  placeholder="Nama Penerima"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maturity_date">Jatuh Tempo</Label>
                <Input
                  id="maturity_date"
                  name="maturity_date"
                  type="date"
                  defaultValue={invoice?.maturity_date?.toString().split('T')[0]}
                />
              </div>
            </div>

            {/* Detail Items Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Detail Item</Label>
                <Button type="button" variant="outline" size="sm" onClick={handleAddDetail}>
                  + Tambah Item
                </Button>
              </div>

              {details.map((detail, index) => (
                <div key={index} className="border p-4 rounded-lg space-y-4">
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveDetail(index)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {isProduct ? (
                      <div className="space-y-2 col-span-2">
                        <Label>Produk</Label>
                        <Select
                          value={detail.product_id?.toString()}
                          onValueChange={(value) => handleDetailChange(index, 'product_id', parseInt(value))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih Produk" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="1">Produk 1</SelectItem>
                              {/* Add more products from your database */}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <Label>Unit</Label>
                          <Select
                            value={detail.unit_id?.toString()}
                            onValueChange={(value) => handleDetailChange(index, 'unit_id', parseInt(value))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih Unit" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectItem value="1">Unit 1</SelectItem>
                                {/* Add more units from your database */}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Deskripsi</Label>
                          <Input
                            value={detail.desc}
                            onChange={(e) => handleDetailChange(index, 'desc', e.target.value)}
                            placeholder="Deskripsi item"
                          />
                        </div>
                      </>
                    )}

                    <div className="space-y-2">
                      <Label>Jumlah</Label>
                      <Input
                        type="number"
                        value={detail.amount}
                        onChange={(e) => handleDetailChange(index, 'amount', parseFloat(e.target.value))}
                        placeholder="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Diskon (%)</Label>
                      <Input
                        type="number"
                        value={detail.discount}
                        onChange={(e) => handleDetailChange(index, 'discount', parseFloat(e.target.value))}
                        placeholder="0"
                      />
                    </div>

                    <div className="space-y-2 col-span-2">
                      <Label>Sub Total</Label>
                      <Input
                        type="number"
                        value={detail.sub_total}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Batal
              </Button>
            </DialogClose>
            <Button type="submit">Simpan</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
