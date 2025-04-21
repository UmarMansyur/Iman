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
    setIsPrinting(true);
    const response = await fetch(`/api/transaction-service/${id}`);
    const responseData = await response.json();
    setData(responseData);
    setIsPrinting(false);
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

  if (!data) return <div>Loading...</div>;

  return (
    <div className="w-[96mm] min-h-[140mm] p-4 bg-white font-sans text-[10pt]">
      {/* Logo & Header */}
      <div className="text-center mb-4">
        <h1 className="text-xl font-bold tracking-wide">
          {data?.factory.name}
        </h1>
        <p className="text-[8pt] text-gray-600">{data?.factory.address}</p>
        <div className="border-b-2 border-dashed my-2"></div>
      </div>

      {/* Transaction Details */}
      <div className="text-[8pt] mb-3">
        <div className="flex justify-between">
          <span>No: {data?.transaction_code}</span>
          <span>{formatDate(data?.created_at || "")}</span>
        </div>
        <div className="flex justify-between">
          <span>Kasir: {data?.user.username}</span>
          <span>{formatTime(data?.created_at || "")}</span>
        </div>
      </div>

      {/* Customer Info */}
      <div className="text-[8pt] mb-3">
        <div className="border-b border-dashed pb-1">
          <p>Pelanggan: {data?.buyer.name}</p>
          <p>Alamat: {data?.buyer.address}</p>
        </div>
      </div>

      {/* Items */}
      {/* Items */}
      <div className="text-[8pt] mb-3">
        <div className="border-b border-dashed pb-1 mb-2">
          {data?.DetailTransactionService.map((item, index) => (
            <div key={item.id} className="mb-2">
              <div className="flex justify-between">
                <span className="font-semibold">
                  {index + 1}. {item.service.name}
                </span>
              </div>
              {/* Tambahan keterangan jasa */}
              <div className="pl-4 text-[7pt] text-gray-600">
                <p>Keterangan: {item.desc || "-"}</p>
              </div>
              <div className="flex justify-between pl-4">
                <span>
                  {formatNumber(item.amount)} x {formatNumber(item.price)}
                </span>
                <span>{formatNumber(item.subtotal)}</span>
              </div>
              {item.discount > 0 && (
                <div className="flex justify-between pl-4 text-[7pt] text-gray-600">
                  <span>Diskon:</span>
                  <span>-{formatNumber(item.discount)}</span>
                </div>
              )}
              <div className="flex justify-between pl-4 font-semibold">
                <span>Subtotal:</span>
                <span>{formatNumber(item.subtotal_discount)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="text-[9pt]">
        <div className="flex justify-between mb-1">
          <span>Total:</span>
          <span>{formatNumber(data?.amount || 0)}</span>
        </div>
        <div className="flex justify-between mb-1">
          <span>Uang Muka:</span>
          <span>{formatNumber(data?.down_payment || 0)}</span>
        </div>
        <div className="flex justify-between font-bold">
          <span>Sisa:</span>
          <span>{formatNumber(data?.remaining_balance || 0)}</span>
        </div>
      </div>

      {/* Payment Info */}
      <div className="mt-3 text-[8pt]">
        <div className="border-t border-dashed pt-2">
          <p>Pembayaran: {data?.payment_method.name}</p>
          <p>
            Status:{" "}
            {data?.status === "Pending"
              ? "Menunggu Konfirmasi"
              : data?.status === "Paid"
              ? "Dibayar Sebagian"
              : data?.status === "Canceled"
              ? "Dibatalkan"
              : data?.status === "Paid_Off"
              ? "Lunas"
              : ""}
          </p>
          <p>Jatuh Tempo: {formatDate(data?.maturity_date || "")}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-4 text-[8pt]">
        <div className="border-t border-dashed pt-2">
          <p>Terima kasih atas kepercayaan Anda</p>
          <p className="text-[7pt] text-gray-500 mt-1">
            Struk ini merupakan bukti pembayaran yang sah
          </p>
        </div>
      </div>
    </div>
  );
}
