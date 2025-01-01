/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Building2 } from "lucide-react";

const PrintInvoice = ({ params }: { params: any }) => {
  const paramId: any = React.use(params);
  const id = paramId.id;

  React.useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    const timer = setTimeout(() => {
      window.print();
      window.onafterprint = () => {
        window.close();
      };
    }, 1000);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["invoice", id],
    queryFn: () => getInvoice(id),
  });

  const getInvoice = async (id: string) => {
    const response = await fetch(`/api/distributor/transaksi/${id}`);
    const data = await response.json();
    return data;
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
        {error instanceof Error ? error.message : "Terjadi kesalahan"}
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white text-black">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          {data.factory?.logo ? (
            <img src={data.factory?.logo} alt="Logo" className="w-16 h-16" />
          ) : (
            <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
              <Building2 className="w-8 h-8" />
            </div>
          )}
          <h1 className="text-2xl font-bold mt-2">Invoice</h1>
          <p className="text-sm text-gray-600">{data.invoice_code}</p>
        </div>
        <div className="text-right">
          <p className="text-sm">
            Tanggal: {new Date(data.created_at).toLocaleDateString("id-ID")}
          </p>
          <p className="text-sm mt-1">Status: {data.status_payment}</p>
          <p className="text-sm">Pengiriman: {data.status_delivery}</p>
        </div>
      </div>

      {/* Customer Info */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="font-semibold mb-2">Informasi Pembeli:</h3>
          <p className="text-sm">{data.buyer?.name}</p>
          <p className="text-sm text-gray-600">{data.buyer?.address}</p>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Informasi Pengiriman:</h3>
          <p className="text-sm">{data.location_distributor?.name}</p>
          <p className="text-sm">Metode Pembayaran: {data.payment_method?.name}</p>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mb-8">
        <thead>
          <tr className="border-b-2 border-gray-300">
            <th className="text-left py-2">Produk</th>
            <th className="text-right py-2">Jumlah</th>
            <th className="text-right py-2">Harga</th>
            <th className="text-right py-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {data.DetailTransactionDistributor.map((item: any) => (
            <tr key={item.id} className="border-b border-gray-200">
              <td className="py-2">{item.desc}</td>
              <td className="text-right py-2">{item.amount}</td>
              <td className="text-right py-2">{formatCurrency(item.price)}</td>
              <td className="text-right py-2">
                {formatCurrency(item.sale_price)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary */}
      <div className="flex justify-end mb-8">
        <div className="w-64">
          <div className="flex justify-between mb-2">
            <span>Subtotal:</span>
            <span>{formatCurrency(data.amount)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Biaya Kirim:</span>
            <span>{formatCurrency(data.cost_delivery)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Uang Muka:</span>
            <span>- {formatCurrency(data.down_payment)}</span>
          </div>
          {data.ppn > 0 && (
            <div className="flex justify-between mb-2">
              <span>PPN:</span>
              <span>{formatCurrency(data.ppn)}</span>
            </div>
          )}
          {data.discount > 0 && (
            <div className="flex justify-between mb-2">
              <span>Diskon:</span>
              <span>- {formatCurrency(data.discount)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold border-t-2 border-gray-300 pt-2">
            <span>Sisa Pembayaran:</span>
            <span>{formatCurrency(data.remaining_balance)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-sm">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="font-semibold mb-12">Penerima</p>
            <div className="border-t border-gray-300 pt-2">
              (_________________)
            </div>
          </div>
          <div className="text-center">
            <p className="font-semibold mb-12">Pengirim</p>
            <div className="border-t border-gray-300 pt-2">
              (_________________)
            </div>
          </div>
          <div className="text-center">
            <p className="font-semibold mb-12">Hormat Kami</p>
            <div className="border-t border-gray-300 pt-2">
              ({data.distributor?.username})
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {data.desc_delivery && (
        <div className="mt-8 border-t border-gray-300 pt-4">
          <p className="font-semibold">Catatan Pengiriman:</p>
          <p className="text-sm">{data.desc_delivery}</p>
        </div>
      )}
    </div>
  );
};

export default PrintInvoice;
