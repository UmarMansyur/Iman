/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Check, Loader2, PencilLine, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


interface ActionCellProps {
  row: any;
  fetchData: () => Promise<void>;
}

export function ActionCell({ row, fetchData }: ActionCellProps) {
  const [receivedAmounts, setReceivedAmounts] = useState<{ [key: number]: string }>({});
  const [data, setData] = useState<any[]>();
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: any, id: number, amount: number) => {
    const inputValue = e.target.value.replace(/[^\d,]/g, '');
    const numericValue = inputValue.replace(/,/g, '.');

    if (isNaN(Number(numericValue))) {
      toast.error("Masukkan nilai yang valid");
      return;
    }

    if (Number(numericValue) > amount) {
      toast.error("Jumlah diterima tidak boleh lebih besar dari jumlah order");
      return;
    }

    const formattedValue = numericValue
      ? numericValue.replace(/\./g, ',')
      : '';

    const existingData = data?.find((item: any) => item.id === id);

    if (existingData) {
      existingData.amount_received = formattedValue;
    } else {
      setData(data ? [...data, { id, amount_received: formattedValue }] : [{ id, amount_received: formattedValue }]);
    }

    setReceivedAmounts({
      ...receivedAmounts,
      [id]: formattedValue,
    });
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    const formattedData = data?.map((item) => ({
      id: item.id,
      amount_received: item.amount_received.replace(/,/g, '.'),
    }));

    const response = await fetch(`/api/distributor/order-bahan-baku/${row.original.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: formattedData
      })
    });
    const responseData = await response.json();
    if (!response.ok) {
      toast.error(responseData.error);
    } else {
      toast.success(responseData.message);
      fetchData();
    }
    setIsLoading(false);
  }

  const handleDelete = async () => {
    const response = await fetch(`/api/distributor/order-bahan-baku/${row.original.id}`, {
      method: "DELETE",
    });
    const responseData = await response.json();
    if (!response.ok) {
      toast.error(responseData.error);
    } else {
      toast.success(responseData.message);
      await fetchData();
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Dialog>
        <DialogTrigger asChild>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <PencilLine className="w-4 h-4" />
            </Button>
          </div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Konfirmasi Penerimaan Order</DialogTitle>
            <DialogDescription>
              Konfirmasi penerimaan order bahan baku
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4">
              <div className="flex justify-between">
                <div>
                  <Label>Distributor</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Avatar>
                      <AvatarImage src={row.original.distributor?.thumbnail} />
                      <AvatarFallback>
                        {row.original.distributor?.username?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {row.original.distributor?.username}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {row.original.distributor?.email}
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(row.original.created_at).toLocaleDateString(
                      "id-ID",
                      {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      }
                    )}
                  </div>
                </div>
              </div>

              <div>
                <Label>Factory</Label>
                <p className="mt-1">{row.original.factory}</p>
              </div>

              <div>
                <Label>Factory Distributor</Label>
                <p className="mt-1">{row.original.factoryDistributor?.name}</p>
              </div>

              <div>
                <Label>Keterangan</Label>
                <p className="mt-1">{row.original.desc}</p>
              </div>

              <div>
                <Label>Konfirmasi Penerimaan Order</Label>
                <div className="border rounded-lg mt-2">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">Material</th>
                        <th className="px-4 py-2 text-center">Satuan</th>
                        <th className="px-4 py-2 text-right">Jumlah Order</th>
                        <th className="px-4 py-2 text-right w-56">Jumlah Diterima</th>
                      </tr>
                    </thead>
                    <tbody>
                      {row.original.DetailOrderBahanBakuDistributor?.map(
                        (detail: any, index: number) => (
                          <tr key={index} className="border-t">
                            <td className="px-4 py-2">
                              {detail.material_distributor?.name}
                            </td>
                            <td className="px-4 py-2 text-center">
                              {detail.material_distributor?.unit?.name}
                            </td>
                            <td className="px-4 py-2 text-right">
                              {detail.amount.toLocaleString("id-ID")}
                            </td>
                            <td className="px-4 py-2 text-right w-56">
                              <Input
                                type="text"
                                className="w-full"
                                placeholder={detail.amount_received?.toLocaleString("id-ID") || "0"}
                                value={receivedAmounts[detail.id] || ''}
                                onChange={(e: any) => handleChange(e, detail.id, detail.amount)}
                              />
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSubmit} disabled={isLoading} type="button" aria-disabled={isLoading}>
                  {
                    isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Konfirmasi
                      </>
                    )
                  }
                </Button>
              </div>
              <div>
                <Label>Daftar Bahan</Label>
                <div className="border rounded-lg mt-2">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">Material</th>
                        <th className="px-4 py-2 text-left">Jumlah</th>
                        <th className="px-4 py-2 text-left">Harga</th>
                        <th className="px-4 py-2 text-left">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {row.original.DetailOrderBahanBakuDistributor?.map(
                        (detail: any, index: number) => (
                          <tr key={index} className="border-t">
                            <td className="px-4 py-2">
                              {detail.material_distributor?.name} /{" "}
                              {detail.material_distributor?.unit?.name}
                            </td>
                            <td className="px-4 py-2">
                              {detail.amount.toLocaleString("id-ID")}
                            </td>
                            <td className="px-4 py-2">
                              Rp {detail.price.toLocaleString("id-ID")}
                            </td>
                            <td className="px-4 py-2">
                              Rp {detail.sub_total.toLocaleString("id-ID")}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td
                          colSpan={3}
                          className="px-4 py-2 font-medium text-right"
                        >
                          Total Keseluruhan:
                        </td>
                        <td className="px-4 py-2 font-bold">
                          Rp {row.original.total.toLocaleString("id-ID")}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Tutup</Button>
              </DialogClose>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" size="sm">
            <Trash2 className="w-4 h-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah anda yakin ingin menghapus order ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Hapus order ini akan menghapus semua data yang terkait dengan order ini.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}