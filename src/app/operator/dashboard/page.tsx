import MainPage from "@/components/main";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

// Tipe data untuk produk
interface Product {
  id: number;
  name: string;
  stock: number;
  price: number;
  category: string;
}

// Data dummy untuk contoh
const products: Product[] = [
  {
    id: 1,
    name: "Kopi Arabika",
    stock: 100,
    price: 50000,
    category: "Minuman",
  },
  {
    id: 2,
    name: "Teh Hijau",
    stock: 150,
    price: 25000,
    category: "Minuman",
  },
  // Tambahkan produk lainnya di sini
];

export default function Layout() {
  return (
    <MainPage>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Daftar Produk</h2>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Tambah Produk
          </Button>
        </div>

        <Card className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No</TableHead>
                <TableHead>Nama Produk</TableHead>
                <TableHead>Stok</TableHead>
                <TableHead>Harga</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product, index) => (
                <TableRow key={product.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                    }).format(product.price)}
                  </TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm">
                        Hapus
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </MainPage>
  );
}