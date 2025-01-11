/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import MainPage from "@/components/main";
import { useEffect, useState } from "react";
import { useUserStore } from "@/store/user-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LoaderScreen from "@/components/views/loader";
import EmptyData from "@/components/views/empty-data";
import { formatProduction } from "@/lib/utils";

interface Product {
  id: number;
  factory_id: number;
  name: string;
  type: string;
  price: number;
  price_per_pack: number;
}

interface StockData {
  product: Product;
  stockIn: number;
  stockOut: number;
  available_stock: number;
}

interface Summary {
  totalStockIn: number;
  totalStockOut: number;
  availableStock: number;
  totalProducts: number;
}

export default function DataStock() {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useUserStore();

  const fetchStocks = async () => {
    try {
      const response = await fetch(`/api/distributor/data-stock?distributor_id=${user?.id}&factory_id=${user?.factory_selected?.id}`);
      const data = await response.json();
      if (response.ok) {
        setStocks(data.data);
        setSummary(data.summary);
      }
    } catch (error) {
      console.error("Error fetching stocks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchStocks();
    }
  }, [user?.id]);

  return (
    <MainPage>
      {!loading && summary && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Produk</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-14 0h14" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalProducts}</div>
              <p className="text-xs text-muted-foreground">Jenis Produk</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Stok Masuk</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalStockIn} Bal</div>
              <p className="text-xs text-muted-foreground">({summary.totalStockIn * 20} Pack)</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Stok Keluar</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalStockOut} Bal</div>
              <p className="text-xs text-muted-foreground">({summary.totalStockOut * 20} Pack)</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stok Tersedia</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.availableStock} Bal</div>
              <p className="text-xs text-muted-foreground">({summary.availableStock * 20} Pack)</p>
            </CardContent>
          </Card>
        </div>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Data Stok</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
           <LoaderScreen />
          ) : (
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3">No</th>
                    <th scope="col" className="px-6 py-3">Nama Produk</th>
                    <th scope="col" className="px-6 py-3">Tipe</th>
                    <th scope="col" className="px-6 py-3 text-right">Harga</th>
                    <th scope="col" className="px-6 py-3 text-right">Stok Keluar</th>
                    <th scope="col" className="px-6 py-3 text-right">Stok Tersedia</th>
                  </tr>
                </thead>
                <tbody>
                  {stocks.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-6 py-4 text-center">
                        <EmptyData text="Data Stok Tidak Ada" />
                      </td>
                    </tr>
                  ) : (
                    stocks.map((stock, index) => (
                      <tr key={stock.product.id} className="bg-white border-b hover:bg-gray-50">
                        <td className="px-6 py-4">{index + 1}</td>
                        <td className="px-6 py-4">{stock.product.name}</td>
                        <td className="px-6 py-4">{stock.product.type}</td>
                        <td className="px-6 py-4 text-right">
                          {new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                          }).format(stock.product.price_per_pack).slice(0, -3)}
                        </td>
                        <td className="px-6 py-4 text-right">{formatProduction(stock.stockOut * 20).bal}</td>
                        <td className="px-6 py-4 text-right">{formatProduction(stock.available_stock * 20).bal}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </MainPage>
  );
}