"use client";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";
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
    <Card className="bg-white rounded-lg border border-gray-200">
      <div className="flex justify-between items-center border-b border-gray-200 px-2 py-2 mb-3">
        <div className="flex flex-col gap-1 ps-2">
        <h1 className="text-xl font-bold">Transaksi Terbaru</h1>
          <p className="text-sm text-gray-500">
            Transaksi terbaru dari semua pabrik
          </p>
        </div>
        <button type="button" className="text-sm bg-transparent p-2">
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>
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
    </Card>
  );
}
