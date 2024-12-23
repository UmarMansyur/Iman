/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";

const PrintInvoice = ({ params }: { params: any }) => {
  const paramId: any = React.use(params);
  const id = paramId.id;
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["invoice", id],
    queryFn: () => getInvoice(id),
  });

  const getInvoice = async (id: string) => {
    const response = await fetch(`/api/transaction/${id}`);
    const data = await response.json();
    return data.data;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount).slice(0, -3);
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError)
    return (
      <div>
        Error:{" "}
        {error instanceof Error ? error.message : "An unknown error occurred"}
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white text-black">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          {/* beri logo */}
          {data.factory?.logo && (
            <img src={data.factory?.logo} alt="Logo" className="w-16 h-16" />
          )}
          <h1 className="text-2xl font-bold">{data.factory?.name}</h1>
          <p className="text-sm">{data.factory?.address}</p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-semibold">{data.invoice_code}</h2>
          <p className="text-sm">
            Tanggal: {new Date(data.created_at).toLocaleDateString("id-ID")}
          </p>
        </div>
      </div>

      {/* Customer Info */}
      <div className="mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold mb-1">Informasi Pembeli:</h3>
            <p>{data.buyer?.name}</p>
            <p className="text-sm">{data.buyer?.address}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Metode Pembayaran: {data.payment_method?.name}</h3>
            <p className="font-semibold">Status: {data.payment_status}</p>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mb-6">
        <thead>
          <tr className="border-b-2 border-gray-300">
            <th className="text-left py-2">Produk</th>
            <th className="text-right py-2">Jumlah</th>
            <th className="text-right py-2">Harga</th>
            <th className="text-right py-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {data.detailInvoices.map((item: any) => (
            <tr key={item.id} className="border-b border-gray-200">
              <td className="py-2">{item.desc}</td>
              <td className="text-right py-2">{item.amount}</td>
              <td className="text-right py-2">{formatCurrency(item.price)}</td>
              <td className="text-right py-2">
                {formatCurrency(item.sub_total)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary */}
      <div className="flex justify-end mb-6">
        <div className="w-64">
          <div className="flex justify-between mb-2">
            <span>Subtotal:</span>
            <span>{formatCurrency(data.sub_total)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Ongkos Kirim:</span>
            <span>{formatCurrency(data.deliveryTracking[0]?.cost || 0)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Uang Muka:</span>
            <span>{formatCurrency(data.down_payment)}</span>
          </div>
          <div className="flex justify-between font-bold border-t-2 border-gray-300 pt-2">
            <span>Total:</span>
            <span>{formatCurrency(data.total)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-sm">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="font-semibold mb-12">Penerima</p>
            <div className="border-t border-gray-300 pt-3">
              (_________________)
            </div>
          </div>
          <div className="text-center">
            <p className="font-semibold mb-12">Pengirim</p>
            <div className="border-t border-gray-300 pt-3">
              (_________________)
            </div>
          </div>
          <div className="text-center">
            <p className="font-semibold mb-12">Hormat Kami</p>
            <div className="border-t border-gray-300 pt-3">
              ({data.user.username})
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {data.notes && (
        <div className="mt-6 border-t border-gray-300 pt-4">
          <p className="font-semibold">Catatan:</p>
          <p className="text-sm">{data.notes}</p>
        </div>
      )}
    </div>
  );
};

export default PrintInvoice;
