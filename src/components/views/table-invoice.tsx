"use client";
import { Badge } from "../ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

export default function TableInvoice() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-3">Transaksi Terbaru</h1>
      <Table className="rounded-lg">
        <TableHeader className="overflow-hidden">
          <TableRow className="bg-gray-100">
            <TableHead>Nomor Faktur</TableHead>
            <TableHead>Metode Pembayaran</TableHead>
            <TableHead>Tanggal</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[1, 2, 3, 4, 5, 6].map((item: number) => (
            <TableRow className="hover:bg-gray-100" key={item}>
              <TableCell className="font-medium">INV001</TableCell>
              <TableCell>Paid</TableCell>
              <TableCell>Credit Card</TableCell>
              <TableCell>
                <Badge className="bg-blue-500/50 text-blue-600">
                  Cash
                </Badge>
              </TableCell>
              <TableCell className="text-right">Rp. 50.000</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
