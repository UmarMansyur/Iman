/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import {
  Package2,
  ShoppingCart,
  Receipt,
  DollarSign,
  Loader2,
} from "lucide-react";
import MainPage from "@/components/main";
import CardDashboard from "@/components/card-product";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUserStore } from "@/store/user-store";
import { formatNumber } from "@/lib/number";
import EmptyData from "@/components/views/empty-data";
import { formatProduction } from "@/lib/utils";

// Tipe data untuk produk
interface Product {
  id: number;
  name: string;
  type: string;
  price: number;
  sold: number;
  stock: number;
  stock_pack: number;
  stock_press: number;
  stock_bal: number;
  stock_karton: number;
  per_bal: number;
  per_karton: number;
  per_slop: number;
}

export default function Layout() {
  const [products, setProducts] = useState<Product[]>([]);
  const [statistics, setStatistics] = useState<any>({});
  const { user } = useUserStore();
  const [loading, setLoading] = useState(true);
  // Tambahkan data dashboard
  const datas = [
    {
      icon: <Package2 />,
      title: "Total Produk",
      value: formatNumber(statistics.totalProducts),
    },
    {
      icon: <ShoppingCart />,
      title: "Total Stok Tersedia",
      value: formatNumber(statistics.totalAvailableStock),
    },
    {
      icon: <Receipt />,
      title: "Total Stok Terjual",
      value: formatNumber(statistics.totalSoldStock),
    },
    {
      icon: <DollarSign />,
      title: "Total Nilai Produk",
      value: formatNumber(statistics.totalProductValue),
    },
  ];

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      document.title = "Stok Produk - Indera Distribution";
      if (user?.factory_selected?.id) {
        const response = await fetch(
          `/api/stock-product?factory_id=${user?.factory_selected?.id}`
        );
        const data = await response.json();
        setProducts(data.data);
        setStatistics(data.statistics);
      }
      setLoading(false);
    }
    fetchData();
  }, [user]);

  return loading ? (
    <div className="flex justify-center items-center h-screen">
      <Loader2 className="w-4 h-4 animate-spin" />
    </div>
  ) : (
    <MainPage>
      <div className="space-y-4">
        {/* Tambahkan section dashboard */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Overview Stok</h2>
          <p className="text-muted-foreground">Ringkasan stok produk</p>
          <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-4 mt-6">
            {datas.map((data, index) => (
              <CardDashboard
                key={index}
                icon={data.icon}
                title={data.title}
                value={data.value}
              />
            ))}
          </div>
        </div>

        {/* Card table produk tetap sama */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Produk</CardTitle>
            <CardDescription>
              Stok produk yang tersedia merupakan hasil pelaporan dari inputan
              produksi harian.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table className="border">
              <TableHeader className="border-b font-bold uppercase text-bal">
                <TableRow className="divide-x">
                  <TableHead
                    rowSpan={2}
                    className="font-bold text-black text-center"
                  >
                    No
                  </TableHead>
                  <TableHead rowSpan={2} className="font-bold text-black">
                    Nama Produk
                  </TableHead>
                  <TableHead
                    rowSpan={2}
                    className="font-bold text-black text-center"
                  >
                    Tipe
                  </TableHead>
                  <TableHead
                    colSpan={2}
                    className="font-bold text-center text-black"
                  >
                    Harga
                  </TableHead>
                  <TableHead
                    rowSpan={2}
                    className="font-bold text-black text-end"
                  >
                    Stok Terjual
                  </TableHead>
                  <TableHead
                    colSpan={4}
                    className="text-center font-bold text-black"
                  >
                    Stok Tersedia
                  </TableHead>
                </TableRow>
                <TableRow>
                  <TableHead className="text-black font-bold text-end border-r border-l">
                    Pack
                  </TableHead>
                  <TableHead className="text-black font-bold text-end border-r border-l">
                    Bal
                  </TableHead>
                  <TableHead className="text-black font-bold text-end border-r border-l">
                    Karton
                  </TableHead>
                  <TableHead className="text-black font-bold text-end border-r">
                    Bal
                  </TableHead>
                  <TableHead className="text-black font-bold text-end border-r">
                    Press
                  </TableHead>
                  <TableHead className="text-black font-bold text-end border-r">
                    Pack
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y">
                {products.map((product, index) => (
                  <TableRow key={product.id} className="divide-x text-black">
                    <TableCell className="text-black text-center">
                      {index + 1}.
                    </TableCell>
                    <TableCell className="text-black">{product.name}</TableCell>
                    <TableCell className="text-black text-center">
                      {product.type}
                    </TableCell>
                    <TableCell className="text-black text-end">
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                      })
                        .format(product.price)
                        .slice(0, -3)}
                    </TableCell>
                    <TableCell className="text-black text-end">
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                      })
                        .format(product.price * (product.per_bal || 200))
                        .slice(0, -3)}
                    </TableCell>
                    <TableCell className="text-end">
                      {formatProduction(product.sold).bal} Bal -{" "}
                      {formatProduction(product.sold).pack} Pack
                    </TableCell>
                    <TableCell className="text-end">
                      {new Intl.NumberFormat("id-ID", {
                        style: "decimal",
                      }).format(product.stock_karton)}
                    </TableCell>
                    <TableCell className="text-end">
                      {new Intl.NumberFormat("id-ID", {
                        style: "decimal",
                      }).format(product.stock_bal)}
                    </TableCell>
                    <TableCell className="text-end">
                      {new Intl.NumberFormat("id-ID", {
                        style: "decimal",
                      }).format(product.stock_press)}
                    </TableCell>
                    <TableCell className="text-end">
                      {new Intl.NumberFormat("id-ID", {
                        style: "decimal",
                      }).format(product.stock_pack)}
                    </TableCell>
                  </TableRow>
                ))}
                {products.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center">
                      <EmptyData text="Produk Belum Tersedia. Silahkan Tambahkan Produk Terlebih Dahulu di Menu Daftar Produk!" />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainPage>
  );
}
