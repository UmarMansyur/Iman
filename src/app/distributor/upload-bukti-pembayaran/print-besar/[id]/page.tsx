"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Building2 } from "lucide-react";

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
    }, 1100);

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
    const response = await fetch(`/api/transaction/cetak/${id}`);
    const data = await response.json();
    return data.data;
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
  const itemsPerPage = 6; // Mengubah dari 11 menjadi 6 item per halaman
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

  const pagedItems = getPagedItems(data.detailInvoices);

  return (
    <div className="print-container font-sans">
      {pagedItems.map((pageItems: any[], pageIndex: number) => (
        <div
          key={pageIndex}
          className="h-[140mm] w-[210mm] mx-auto p-4 bg-white text-black text-[11px] leading-tight"
        >
          <div className="flex flex-col justify-between h-full pt-3">
            <div>
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <div className="w-8 h-8 bg-gray-200 rounded-sm flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <h1 className="text-[11pt] font-bold">
                    {data.factory?.name}
                  </h1>
                  <p className="text-[11px]">{data.factory?.address}</p>
                </div>
                <div className="text-right">
                  <h2 className="text-[11pt] font-semibold">
                    {data.invoice_code}
                  </h2>
                  <p className="text-[11px]">
                    Tanggal:{" "}
                    {new Date(data.created_at).toLocaleDateString("id-ID")}
                  </p>
                  <p className="text-[11px]">
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
                      {data.buyer?.name} - {data.buyer?.address}
                    </p>
                    <h3 className="font-semibold">Lokasi Pengiriman:</h3>
                    <p>{data.deliveryTracking[0]?.location?.name}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      Pembayaran: {data.payment_method?.name}
                    </h3>
                    {data.payment_status === "Paid" && <p>Status: Dibayar</p>}
                    {data.payment_status === "Pending" && (
                      <p>Status: Menunggu Konfirmasi Pembayaran</p>
                    )}
                    {data.payment_status === "Paid_Off" && <p>Status: Lunas</p>}
                    {data.payment_status === "Failed" && <p>Status: Gagal</p>}
                    {data.payment_status === "Cancelled" && (
                      <p>Status: Ditolak</p>
                    )}
                    <div className="text-[11px]">
                      <h3 className="font-semibold">Catatan Pengiriman:</h3>
                      <p>{data.deliveryTracking[0]?.desc}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full mb-2 text-[11px]">
                <thead>
                  <tr className="border border-gray-300">
                    <th className="text-left py-[1px]">No</th>
                    <th className="text-left py-[1px]">Produk</th>
                    <th className="text-right py-[1px]">Jml</th>
                    <th className="text-right py-[1px]">Harga</th>
                    <th className="text-right py-[1px]">Total</th>
                  </tr>
                </thead>
                <tbody className="border border-gray-300">
                  {pageItems.map((item: any, index: number) => (
                    <tr key={item.id}>
                      <td className="py-[1px]">
                        {pageIndex * itemsPerPage + index + 1}.{" "}
                      </td>
                      <td className="py-[1px]">{item.desc}</td>
                      <td className="text-right py-[1px]">{item.amount}</td>
                      <td className="text-right py-[1px]">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="text-right py-[1px]">
                        {formatCurrency(item.sub_total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pageIndex !== pagedItems.length - 1 && (
              <div className=" mb-2">
                <p className="text-[11px] text-center font-bold">
                  Terima Kasih
                </p>
                <p className="text-[11px] text-center">
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
                      <div className="absolute -bottom-32 text-red-500 text-3xl font-bold translate-x-1/2">
                        {data.payment_status === "Paid" && "Bayar Sebagian"}
                        {data.payment_status === "Pending" && "Menunggu Konfirmasi"}
                        {data.payment_status === "Paid_Off" && "Lunas"}
                        {data.payment_status === "Failed" && "Gagal"}
                        {data.payment_status === "Cancelled" && "Ditolak"}
                      </div>
                    </div>
                    {data.notes && (
                      <div className="border-t border-gray-300 pt-1">
                        <p className="font-semibold">Catatan:</p>
                        <p className="text-[11px]">{data.notes}</p>
                      </div>
                    )}
                  </div>
                  <div className="w-48">
                    <div className="flex justify-between mb-1">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(data.sub_total)}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span>Ongkos Kirim:</span>
                      <span>
                        {formatCurrency(data.deliveryTracking[0]?.cost || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span>Uang Muka:</span>
                      <span>- {formatCurrency(data.down_payment)}</span>
                    </div>
                    <div className="flex justify-between font-bold border-t border-gray-300 pt-1">
                      <span>Total:</span>
                      <span>
                        {formatCurrency(data.total - data.down_payment)}
                      </span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span>Sisa Pembayaran:</span>
                      <span>{formatCurrency(data.remaining_balance)}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span>Jatuh Tempo:</span>
                      <span>
                        {data.remaining_balance > 0 && data.maturity_date ? (
                          <span>
                            {new Date(data.maturity_date).toLocaleDateString(
                              "id-ID"
                            )}
                          </span>
                        ) : (
                          <span>-</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="text-[11px]">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center">
                      <p className="font-semibold mb-6">Penerima</p>
                      <div className="">
                        {data.deliveryTracking[0]?.recipient ? (
                          "(" + data.deliveryTracking[0]?.recipient + ")"
                        ) : (
                          "(_____________)"
                        )}
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold mb-6">Pengirim</p>
                      <div className="">
                        {data.deliveryTracking[0]?.sales_man ? (
                          "(" + data.deliveryTracking[0]?.sales_man + ")"
                        ) : (
                          "(_____________)"
                        )}
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold mb-6">Hormat Kami</p>
                      <div className="">
                        ({data.user.username})
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PrintInvoice;
