"use client";
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import LoaderScreen from "@/components/views/loader";

const NCRInvoice = ({ id }: { id: string }) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/transaction/${id}`);
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.message || 'Failed to fetch invoice data');
        }
        
        setData(result.data);
      } catch (error) {
        console.error('Error fetching invoice:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  if (isLoading) {
    return <LoaderScreen />;
  }

  if (!data) {
    return <div>No invoice data found</div>;
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="w-full min-h-screen bg-white p-8 print:p-0">
      {/* Print copies: Original, Duplicate, Triplicate */}
      {["ORIGINAL", "DUPLICATE", "TRIPLICATE"].map((copy: string, index: number) => (
        <div key={index} className="mb-8 print:mb-0 print:page-break-after-always">
          <Card className="border-2">
            <CardContent className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold">{data.factory.name}</h1>
                  <p className="text-sm text-gray-600">{data.factory.address}</p>
                  <p className="text-sm text-gray-600">Status: {data.factory.status}</p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-semibold text-gray-800">INVOICE</div>
                  <div className="text-sm text-gray-600 mt-1">{data.invoice_code}</div>
                  <div className="mt-2 px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                    {copy}
                  </div>
                  <div className="mt-2 text-sm">
                    <span className={`px-2 py-1 rounded ${
                      data.payment_status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {data.payment_status}
                    </span>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Invoice Details */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold mb-2">Invoice To:</h3>
                  <div className="text-sm">
                    <p className="font-semibold">{data.buyer.name}</p>
                    <p>{data.buyer.address}</p>
                    <p>Type: {data.is_distributor ? 'Distributor' : 'Regular Customer'}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Invoice Details:</h3>
                  <div className="text-sm">
                    <p>Date: {formatDate(data.created_at)}</p>
                    <p>Payment Method: {data.payment_method.name}</p>
                    <p>Notes: {data.notes || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="border rounded-lg overflow-hidden mb-6">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left">Description</th>
                      <th className="px-4 py-2 text-right">Quantity</th>
                      <th className="px-4 py-2 text-right">Unit Price</th>
                      <th className="px-4 py-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.detailInvoices.map((item: any, index: number) => (
                      <tr key={index} className="border-t">
                        <td className="px-4 py-2">
                          <div>{item.desc}</div>
                          <div className="text-xs text-gray-500">Type: {item.product.type}</div>
                        </td>
                        <td className="px-4 py-2 text-right">{item.amount}</td>
                        <td className="px-4 py-2 text-right">{formatCurrency(item.price)}</td>
                        <td className="px-4 py-2 text-right">{formatCurrency(item.sub_total)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr className="border-t">
                      <td colSpan={3} className="px-4 py-2 text-right">Subtotal:</td>
                      <td className="px-4 py-2 text-right">{formatCurrency(data.sub_total)}</td>
                    </tr>
                    {data.discount > 0 && (
                      <tr>
                        <td colSpan={3} className="px-4 py-2 text-right">Discount:</td>
                        <td className="px-4 py-2 text-right">{formatCurrency(data.discount)}</td>
                      </tr>
                    )}
                    {data.ppn > 0 && (
                      <tr>
                        <td colSpan={3} className="px-4 py-2 text-right">PPN:</td>
                        <td className="px-4 py-2 text-right">{formatCurrency(data.ppn)}</td>
                      </tr>
                    )}
                    <tr>
                      <td colSpan={3} className="px-4 py-2 text-right">Delivery Cost:</td>
                      <td className="px-4 py-2 text-right">
                        {formatCurrency(data.deliveryTracking[0]?.cost || 0)}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="px-4 py-2 text-right">Down Payment:</td>
                      <td className="px-4 py-2 text-right">{formatCurrency(data.down_payment)}</td>
                    </tr>
                    <tr className="font-bold">
                      <td colSpan={3} className="px-4 py-2 text-right">Total:</td>
                      <td className="px-4 py-2 text-right">{formatCurrency(data.total)}</td>
                    </tr>
                    <tr className="font-bold">
                      <td colSpan={3} className="px-4 py-2 text-right">Remaining Balance:</td>
                      <td className="px-4 py-2 text-right">{formatCurrency(data.remaining_balance)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Delivery Information */}
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Delivery Information:</h3>
                <div className="text-sm">
                  <p>Status: {data.deliveryTracking[0]?.status}</p>
                  <p>Location: {data.deliveryTracking[0]?.location?.name}</p>
                  <p>Description: {data.deliveryTracking[0]?.desc}</p>
                </div>
              </div>

              {/* Terms & Notes */}
              <div className="text-sm text-gray-600 mb-6">
                <p>Notes:</p>
                <p>{data.notes || '-'}</p>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-3 gap-6 mt-8">
                <div className="text-center">
                  <div className="h-20 border-b border-dashed"></div>
                  <p className="mt-2 text-sm font-semibold">Admin</p>
                </div>
                <div className="text-center">
                  <div className="h-20 border-b border-dashed"></div>
                  <p className="mt-2 text-sm font-semibold">Delivery</p>
                </div>
                <div className="text-center">
                  <div className="h-20 border-b border-dashed"></div>
                  <p className="mt-2 text-sm font-semibold">Customer</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
};

export default NCRInvoice;