"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";

const PrintInvoice = ({ params }: { params: any }) => {
  const paramId: any = React.use(params);
  const id = paramId.id;

  React.useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
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
    })
      .format(amount)
      .slice(0, -3);
  };

  // Fungsi untuk memisahkan item menjadi beberapa halaman
  const itemsPerPage = 6; // Mengubah dari 10 menjadi 6 item per halaman
  const getPagedItems = (items: any[]) => {
    const pages = [];
    for (let i = 0; i < items.length; i += itemsPerPage) {
      pages.push(items.slice(i, i + itemsPerPage));
    }
    return pages;
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError)
    return (
      <div>
        Error:{" "}
        {error instanceof Error ? error.message : "An unknown error occurred"}
      </div>
    );

  const pagedItems = getPagedItems(data.transaction.DetailTransactionDistributor);

  return (
    <div className="print-container font-sans">
      {pagedItems.map((pageItems: any[], pageIndex: number) => (
        <div
          key={pageIndex}
          className="h-[140mm] w-[210mm] mx-auto p-4 bg-white text-black text-[8pt] leading-tight"
        >
          <div className="flex flex-col justify-between h-full pt-5 pb-3">
            <div>
              {/* Header */}
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="w-24 h-24 bg-gray-200 rounded-sm flex items-center justify-center">
                    <Image src="/logo.svg" alt="logo" width={40} height={40} className="w-full h-full" />
                  </div>
                  {/* <h1 className="text-[10pt] font-bold">
                    {data.data_distributor?.name}
                  </h1> */}
                  <p className="text-[8pt]">{data.data_distributor?.address || "-"}</p>
                </div>
                <div className="text-right">
                  <h2 className="text-[10pt] font-semibold">
                    {data.transaction.invoice_code}
                  </h2>
                  <p className="text-[8pt]">
                    Tanggal:{" "}
                    {new Date(data.transaction.created_at).toLocaleDateString("id-ID")}
                  </p>
                  <p className="text-[8pt]">
                    Halaman {pageIndex + 1} dari {pagedItems.length}
                  </p>
                </div>
              </div>

              {/* Customer Info */}
              <div className="mb-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <h3 className="font-semibold">Pembeli:</h3>
                    <p>
                      {data.transaction.buyer?.name} - {data.transaction.buyer?.address}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      Pembayaran: <br /> {data.transaction.payment_method?.name}
                    </h3>
                    {data.transaction.payment_status === "Paid" && <p>Status: Dibayar</p>}
                    {data.transaction.payment_status === "Pending" && (
                      <p>Status: Menunggu Konfirmasi Pembayaran</p>
                    )}
                    {data.transaction.payment_status === "Paid_Off" && <p>Status: Lunas</p>}
                    {data.transaction.payment_status === "Failed" && <p>Status: Gagal</p>}
                    {data.transaction.payment_status === "Cancelled" && (
                      <p>Status: Ditolak</p>
                    )}
                  </div>
                </div>
                <h3 className="font-semibold">Lokasi Pengiriman:</h3>
                <p>{data.transaction.location_distributor.name}</p>
              </div>

              {/* Items Table */}
              <table className="w-full mb-2 text-[8pt]">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="text-left py-1">No</th>
                    <th className="text-left py-1">Produk</th>
                    <th className="text-right py-1">Jumlah</th>
                    <th className="text-right py-1">Harga</th>
                    <th className="text-right py-1">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((item: any, index: number) => (
                    <tr key={item.id} className="border-b border-gray-200">
                      <td className="py-1">
                        {pageIndex * itemsPerPage + index + 1}.{" "}
                      </td>
                      <td className="py-1">{item.desc}</td>
                      <td className="text-right py-1">
                        {item.Product.factory_id ? new Intl.NumberFormat("id-ID").format(item.amount / (item.Product.per_bal || 200)) + " Bal" : new Intl.NumberFormat("id-ID").format(item.amount / (item.Product.per_karton || 800)) + " Karton"}
                      </td>
                      <td className="text-right py-1">
                      {item.Product.factory_id ? new Intl.NumberFormat("id-ID").format(item.sale_price * (item.Product.per_bal || 200)) : new Intl.NumberFormat("id-ID").format(item.sale_price * (item.Product.per_karton || 800))}
                      </td>
                      <td className="text-right py-1">
                        {formatCurrency(item.amount * item.sale_price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pageIndex !== pagedItems.length - 1 && (
              <div className=" mb-2">
                <p className="text-[12pt] text-center font-bold">
                  Terima Kasih
                </p>
                <p className="text-[8pt] text-center">
                  Jangan terima nota pembayaran ini, jika nota pembayaran belum
                  ditandangani oleh operator!
                </p>
              </div>
            )}

            {/* Summary dan Footer hanya ditampilkan di halaman terakhir */}
            {pageIndex === pagedItems.length - 1 && (
              <>
                {/* Summary */}
                <div className="flex justify-between mb-2">
                  <div>
                    <div className="flex justify-between mb-1 relative">
                      <div className="absolute -bottom-20 left-0 text-red-500 text-xl font-bold -rotate-45">
                        {data.transaction.payment_status === "Paid" && "Bayar Sebagian"}
                        {data.transaction.payment_status === "Pending" && "PENDING"}
                        {data.transaction.payment_status === "Paid_Off" && "LUNAS"}
                        {data.transaction.payment_status === "Failed" && "GAGAL"}
                        {data.transaction.payment_status === "Cancelled" && "BATAL"}
                      </div>
                    </div>
                    {/* Notes */}
                    {data.transaction.notes && (
                      <div className="border-t border-gray-300 pt-1">
                        <p className="font-semibold">Catatan:</p>
                        <p className="text-[8pt]">{data.transaction.notes}</p>
                      </div>
                    )}
                  </div>
                  <div className="w-48">
                    <div className="flex justify-between mb-1">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(data.transaction.amount - data.transaction.cost_delivery)}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span>Ongkos Kirim:</span>
                      <span>{formatCurrency(data.transaction.cost_delivery || 0)}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span>Uang Muka:</span>
                      <span>- {formatCurrency(data.transaction.down_payment)}</span>
                    </div>
                    <div className="flex justify-between font-bold border-t border-gray-300 pt-1">
                      <span>Total:</span>
                      <span>
                        {formatCurrency(data.transaction.amount - data.transaction.down_payment)}
                      </span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span>Sisa Pembayaran:</span>
                      <span>{formatCurrency(data.transaction.remaining_balance)}</span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-2 text-[8pt]">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center">
                      <p className="font-semibold mb-6">Penerima</p>
                      <div className="">
                        (_____________)
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold mb-6">Pengirim</p>
                      <div className="">
                        (_____________)
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold mb-6">Hormat Kami</p>
                      <div className="">
                        ({data.transaction.distributor?.username})
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PrintInvoice;
