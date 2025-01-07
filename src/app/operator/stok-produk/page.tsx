/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import {
  Package2,
  ShoppingCart,
  Receipt,
  DollarSign,
  Loader2,
  Info,
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
import { convert, formatNumber } from "@/lib/number";
import EmptyData from "@/components/views/empty-data";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Tipe data untuk produk
interface Product {
  id: number;
  name: string;
  type: string;
  price: number;
  sold: number;
  stock: number;
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
              <Alert className="bg-blue-500 mt-2 text-white">
                <Info className="h-4 w-4 text-white" />
                <AlertTitle>Catatan</AlertTitle>
                <AlertDescription>
                  Stok produk dibawah ini hasil konversi dari stok produk. Jadi jika ada 200 pack maka akan dikonversi jadi 2 ball.
                </AlertDescription>
              </Alert>
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
                  <TableHead rowSpan={2} className="font-bold text-black">
                    Tipe
                  </TableHead>
                  <TableHead rowSpan={2} className="font-bold text-black">
                    Harga
                  </TableHead>
                  <TableHead rowSpan={2} className="font-bold text-black">
                    Stok Terjual
                  </TableHead>
                  <TableHead
                    colSpan={4}
                    className="text-center font-bold text-black"
                  >
                    Stok Tersedia(Konversi)
                  </TableHead>
                </TableRow>
                <TableRow>
                  <TableHead className="text-black font-bold text-end border-r border-l">
                    Pack
                  </TableHead>
                  <TableHead className="text-black font-bold text-end border-r">
                    Slop/Press
                  </TableHead>
                  <TableHead className="text-black font-bold text-end border-r">
                    Bal
                  </TableHead>
                  <TableHead className="text-black font-bold text-end border-r">
                    Karton
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
                    <TableCell className="text-black">{product.type}</TableCell>
                    <TableCell className="text-black">
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                      })
                        .format(product.price)
                        .slice(0, -3)}
                    </TableCell>
                    <TableCell>{product.sold}</TableCell>
                    <TableCell className="text-end">
                      {new Intl.NumberFormat("id-ID", {
                        style: "decimal",
                      }).format(Number(`${convert(product.stock).pack}`))}
                    </TableCell>
                    <TableCell className="text-end">
                      {new Intl.NumberFormat("id-ID", {
                        style: "decimal",
                      }).format(Number(`${convert(product.stock).slop}`))}
                    </TableCell>
                    <TableCell className="text-end">
                      {new Intl.NumberFormat("id-ID", {
                        style: "decimal",
                      }).format(Number(`${convert(product.stock).bal}`))}
                    </TableCell>
                    <TableCell className="text-end">
                      {new Intl.NumberFormat("id-ID", {
                        style: "decimal",
                      }).format(Number(`${convert(product.stock).karton}`))}
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
