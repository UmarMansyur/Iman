/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";

export default function PrintPage({
  params,
}: {
  params: Promise<any>;
}) {
  const paramId = React.use(params);
  const id = paramId.id;
  const [data, setData] = useState<any>(null);
  
  async function fetchData(orderId: string) {
    try {
      const response = await fetch(`/api/distributor/order-bahan-baku/${orderId}`);
      const fetchedData = await response.json();
      setData(fetchedData.data);
    } catch (error: any) {
      console.error(error.message);
    }
  }

  useEffect(() => {
    fetchData(id);
  }, [id]);

  useEffect(() => {
    if (data) {
      window.print();
      window.close();
    }
  }, [data]);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Memuat data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white shadow-sm rounded-lg overflow-hidden">
        {/* Header Section */}
        <div className="p-8 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-gray-50">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-800">Nota Pesanan</h1>
            <p className="text-lg text-gray-600">Indera Distribution</p>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="p-8 bg-white space-y-6">
          <div className="grid grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Nomor Pesanan</p>
                <p className="font-medium">INV-{new Date(data.created_at).toLocaleString().split(',')[0].replace(/[-:]/g, '')}-{data.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  data.type_preorder ? "bg-purple-100 text-purple-800" : "bg-green-100 text-green-800"
                }`}>
                  {data.type_preorder ? "Pre-Order" : "Regular"}
                </span>
              </div>
            </div>
            
            {/* Right Column */}
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Operator</p>
                <p className="font-medium">{data.distributor.username}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Waktu Dibuat</p>
                <p className="font-medium">{new Date(data.created_at).toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="pt-4">
            <p className="text-sm text-gray-500">Deskripsi</p>
            <p className="mt-1 text-gray-700">{data.desc}</p>
          </div>

          {/* Table */}
          <div className="mt-8 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bahan Baku</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Satuan</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Harga Satuan</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.DetailOrderBahanBakuDistributor.map((detail: any, index: number) => (
                  <tr key={detail.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{detail.material_distributor.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{detail.material_distributor.unit.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{detail.amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(detail.price).slice(0, -3)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(detail.sub_total).slice(0, -3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total */}
          <div className="mt-8 border-t border-gray-200 pt-8">
            <div className="text-right">
              <p className="text-sm text-gray-500">Total Harga Item</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(data.total).slice(0, -3)}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
          <p className="text-center text-sm text-gray-500">
            Terima kasih atas kepercayaan Anda menggunakan layanan kami
          </p>
        </div>
      </div>
    </div>
  );
}