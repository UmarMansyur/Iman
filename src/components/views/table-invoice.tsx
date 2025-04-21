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
    <Card className="bg-white border-none">
      <div className="flex justify-between items-center px-2 py-2">
        <div className="flex flex-col gap-1 ps-2">
        <h1 className="text-xl font-bold">Transaksi Terbaru</h1>
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
                <Badge className="bg-success2/20 text-success2 hover:bg-success2 hover:text-white">
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
