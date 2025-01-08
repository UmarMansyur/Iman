/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { Transaction } from "./types";
import { formatNumber, formatDate, formatTime } from "./formater";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function Receipt() {
  const id = useParams();
  const [data, setData] = useState<Transaction | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const fetchTransaction = async () => {
    setIsPrinting(false);
    const response = await fetch(`/api/transaction-service/${id}`);
    const responseData = await response.json();
    setData(responseData);
    setIsPrinting(true);
  };

  useEffect(() => {
    fetchTransaction();
  }, [id]);

  useEffect(() => {
    if (isPrinting) {
      setTimeout(() => {
        window.print();
        // after print
      }, 500);
      window.addEventListener("afterprint", () => {
        setIsPrinting(false);
        window.close();
      }, { once: true });
    }
  }, [data?.transaction_code, isPrinting]);

  return (
    <div className="w-[210mm] h-[140mm] p-8 bg-white font-mono text-sm">
      {/* Header */}
      <div className="text-center border-b-2 border-black pb-4">
        <h1 className="text-xl font-bold">{data?.factory.name}</h1>
        <p className="mt-1">{data?.factory.address}</p>
      </div>

      {/* Transaction Info */}
      <div className="flex justify-between mt-4">
        <div>
          <p>No: {data?.transaction_code}</p>
          <p className="mt-1">Operator: {data?.user.username}</p>
        </div>
        <div className="text-right">
          <p>Tanggal: {formatDate(data?.created_at || "")}</p>
          <p className="mt-1">Waktu: {formatTime(data?.created_at || "")}</p>
        </div>
      </div>

      {/* Customer Info */}
      <div className="mt-4">
        <p>Pelanggan: {data?.buyer.name}</p>
        <p className="mt-1">Alamat: {data?.buyer.address}</p>
      </div>

      {/* Items Table */}
      <div className="mt-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-y-2 border-black">
              <th className="py-2 text-left">Deskripsi</th>
              <th className="py-2 text-right">Qty</th>
              <th className="py-2 text-right">Harga</th>
              <th className="py-2 text-right">Diskon</th>
              <th className="py-2 text-right">Subtotal</th>
              <th className="py-2 text-right">Sub Total Setelah Diskon</th>
            </tr>
          </thead>
          <tbody className="border-b-2 border-black">
            {data?.DetailTransactionService.map((item) => (
              <tr key={item.id} className="border-b border-gray-200">
                <td className="py-2">{item.service.name}</td>
                <td className="py-2 text-right">{formatNumber(item.amount)}</td>
                <td className="py-2 text-right">{formatNumber(item.price)}</td>
                <td className="py-2 text-right">
                  {formatNumber(item.discount)}
                </td>
                <td className="py-2 text-right">
                  {formatNumber(item.subtotal)}
                </td>
                <td className="py-2 text-right">
                  {formatNumber(item.subtotal_discount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="mt-4 flex flex-col items-end">
        <div className="flex justify-between w-1/2">
          <span>Total:</span>
          <span className="ml-4">{formatNumber(data?.amount || 0)}</span>
        </div>
        <div className="flex justify-between w-1/2 mt-1">
          <span>DP:</span>
          <span className="ml-4">{formatNumber(data?.down_payment || 0)}</span>
        </div>
        <div className="flex justify-between w-1/2 mt-1">
          <span>Sisa:</span>
          <span className="ml-4">
            {formatNumber(data?.remaining_balance || 0)}
          </span>
        </div>
      </div>

      {/* Payment Info */}
      <div className="mt-6">
        <p>Metode Pembayaran: {data?.payment_method.name}</p>
        {data?.status === "Pending" && (
          <p className="mt-1">Status: Menunggu Konfirmasi Pembayaran</p>
        )}
        {data?.status === "Paid" && <p className="mt-1">Status: Dibayar</p>}
        {data?.status === "Canceled" && (
          <p className="mt-1">Status: Dibatalkan</p>
        )}
        {data?.status === "Paid_Off" && <p className="mt-1">Status: Lunas</p>}
        <p className="mt-1">
          Jatuh Tempo: {formatDate(data?.maturity_date || "")}
        </p>
      </div>

      {/* Footer */}
      <div className="text-center mt-6">
        <p>Terima kasih atas kepercayaan Anda</p>
      </div>
    </div>
  );
}
