/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
import { Building2 } from "lucide-react";
import Image from "next/image";

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
    if (data?.DetailOrderMaterialUnit?.length > 0) {
      window.print();
      window.close();
    }
  }, [data]);

  if (!data) {
    return <div className="p-6 text-center text-gray-500">Memuat data...</div>;
  }

  return (
    <div className="min-h-[210mm] w-[140mm] mx-auto bg-white p-4 font-mono text-sm">
      {/* Header */}
      <div className="text-center mb-4">
        {/* beri logo */}
        {
          data.factory.logo ? (
            <div className="flex justify-center items-center">
              <Image src={data.factory.logo} alt="Logo" width={100} height={100} />
            </div>
          ) : (
            <div className="flex justify-center items-center">
              <Building2 className="w-10 h-10" />
            </div>
          )
        } 
        <h1 className="text-xl font-bold uppercase">{data.factory.name}</h1>
        <p>{data.factory.address}</p>
      </div>

      {/* Invoice Info */}
      <table className="w-full mb-4 border-dashed border">
        <tbody>
          <tr>
            <td className="border-dashed border px-2 py-1">No. Invoice</td>
            <td className="border-dashed border px-2 py-1">: INV-{new Date(data.created_at).toLocaleString().split(',')[0].replace(/[-:]/g, '')}-{data.id}</td>
            <td className="border-dashed border px-2 py-1">Tanggal</td>
            <td className="border-dashed border px-2 py-1">: {new Date(data.created_at).toLocaleString()}</td>
          </tr>
          <tr>
            <td className="border-dashed border px-2 py-1">Status</td>
            <td className="border-dashed border px-2 py-1">: {
              data.status === 'Approved' ? 'Disetujui' :
              data.status === 'Pending' ? 'Menunggu' : 'Ditolak'
            }</td>
            <td className="border-dashed border px-2 py-1">Petugas</td>
            <td className="border-dashed border px-2 py-1">: {data.user.username}</td>
          </tr>
          <tr>
            <td className="border-dashed border px-2 py-1">Deskripsi</td>
            <td className="border-dashed border px-2 py-1" colSpan={3}>: {data.desc}</td>
          </tr>
        </tbody>
      </table>

      {/* Items Table */}
      <table className="w-full text-sm border-dashed border-collapse mb-4">
        <thead>
          <tr>
            <th className="border-dashed border px-2 py-1 text-left">Bahan Baku</th>
            <th className="border-dashed border px-2 py-1">Satuan</th>
            <th className="border-dashed border px-2 py-1 text-right">Qty</th>
            <th className="border-dashed border px-2 py-1 text-right">Harga</th>
            <th className="border-dashed border px-2 py-1 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {data.DetailOrderMaterialUnit.map((detail: any) => (
            <tr key={detail.id}>
              <td className="border-dashed border px-2 py-1">{detail.materialUnit.material.name}</td>
              <td className="border-dashed border px-2 py-1 text-center">{detail.materialUnit.unit.name}</td>
              <td className="border-dashed border px-2 py-1 text-right">{detail.amount}</td>
              <td className="border-dashed border px-2 py-1 text-right">{new Intl.NumberFormat('id-ID').format(detail.price)}</td>
              <td className="border-dashed border px-2 py-1 text-right">{new Intl.NumberFormat('id-ID').format(detail.amount * detail.price)}</td>
            </tr>
          ))}
          <tr>
            <td colSpan={4} className="border-dashed border px-2 py-1 text-right font-bold">Total:</td>
            <td className="border-dashed border px-2 py-1 text-right font-bold">
              {new Intl.NumberFormat('id-ID').format(data.price)}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Signatures */}
      <div className="grid grid-cols-2 gap-4 text-center mt-8">
        <div>
          <p className="mb-12">Penerima,</p>
          <p>(_________________)</p>
        </div>
        <div>
          <p className="mb-12">Petugas,</p>
          <p>({data.user.username})</p>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: 140mm 210mm;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
            font-family: 'Courier New', Courier, monospace;
          }
          table {
            border-collapse: collapse;
          }
          td, th {
            border-style: dashed;
          }
        }
      `}</style>
    </div>
  );
}