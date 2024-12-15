/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

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
  // Fungsi untuk mengambil data pesanan
  async function fetchData(orderId: string) {
    try {
      const response = await fetch(`/api/order/${orderId}`);
      const fetchedData = await response.json();
      setData(fetchedData);
    } catch (error) {
      console.error("Terjadi kesalahan saat mengambil data:", error);
    }
  }

  useEffect(() => {
    fetchData(id);
  }, [id]);

  useEffect(() => {
    if (data) {
      window.print();
      // close the window after print
      window.close();
    }
  }, [data]);

  if (!data) {
    return <div className="p-6 text-center text-gray-500">Memuat data...</div>;
  }

  return (
    <div className="p-8 font-sans bg-white text-gray-800">
      {/* Header Nota */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold uppercase">Nota Pesanan</h1>
        <p className="text-sm">
          {
            data.factory.address
          }
        </p>
        <hr className="border-gray-300 my-4" />
      </div>

      {/* Informasi Nota */}
      <div className="mb-6">
        <p><strong>Nomor Pesanan:</strong> INV-{new Date(data.created_at).toLocaleString().split(',')[0].replace(/[-:]/g, '')}-{data.id}</p>
        <p><strong>Status:</strong> {data.status}</p>
        <p><strong>Operator:</strong> {data.user.username}</p>
        <p><strong>Waktu Dibuat:</strong> {new Date(data.created_at).toLocaleString()}</p>
        <p><strong>Deskripsi:</strong> {data.desc}</p>
        <hr className="border-gray-300 my-4" />
      </div>

      {/* Tabel Rincian Material */}
      <table className="w-full table-fixed text-sm border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-2 py-1 text-left">Bahan Baku</th>
            <th className="border border-gray-300 px-2 py-1 text-left">Satuan</th>
            <th className="border border-gray-300 px-2 py-1 text-right">Jumlah</th>
            <th className="border border-gray-300 px-2 py-1 text-right">Harga Satuan</th>
            <th className="border border-gray-300 px-2 py-1 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {data.DetailOrderMaterialUnit.map((detail: any, index: number) => (
            <tr key={detail.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              <td className="border border-gray-300 px-2 py-1">{detail.materialUnit.material.name}</td>
              <td className="border border-gray-300 px-2 py-1">{detail.materialUnit.unit.name}</td>
              <td className="border border-gray-300 px-2 py-1 text-right">{detail.amount}</td>
              <td className="border border-gray-300 px-2 py-1 text-right">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(detail.price).slice(0, -3)}</td>
              <td className="border border-gray-300 px-2 py-1 text-right">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(detail.amount * detail.price).slice(0, -3)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="text-right mt-6">
        <p className="text-lg font-bold">Total Harga Item: {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(data.price).slice(0, -3)}</p>
      </div>
    </div>
  );
}
