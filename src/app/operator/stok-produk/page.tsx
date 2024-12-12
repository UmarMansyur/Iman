/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import { Package2, ShoppingCart, Receipt, DollarSign } from "lucide-react";
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
  // Tambahkan data dashboard
  const datas = [
    {
      icon: <Package2 />,
      title: "Total Produk",
      value: statistics.totalProducts,
    },
    {
      icon: <ShoppingCart />,
      title: "Total Stok Tersedia",
      value: statistics.totalAvailableStock,
    },
    {
      icon: <Receipt />,
      title: "Total Stok Terjual",
      value: statistics.totalSoldStock,
    },
    {
      icon: <DollarSign />,
      title: "Total Nilai Produk",
      value: new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      })
        .format(statistics.totalProductValue)
        .slice(0, -3),
    },
  ];

  useEffect(() => {
    async function fetchData() {
      if(user?.factory_selected?.id){
        const response = await fetch(
          `http://localhost:3000/api/stock-product?factory_id=${user?.factory_selected?.id}`
      );
        const data = await response.json();
        setProducts(data.data);
        setStatistics(data.statistics);
      }
    }
    fetchData();
  }, [user]);

  return (
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
              Daftar semua produk yang tersedia di toko kami.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>Nama Produk</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Harga</TableHead>
                  <TableHead>Stok Terjual</TableHead>
                  <TableHead>Stok Tersedia</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product, index) => (
                  <TableRow key={product.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.type}</TableCell>
                    <TableCell>
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                      }).format(product.price)}
                    </TableCell>
                    <TableCell>{product.sold}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainPage>
  );
}
