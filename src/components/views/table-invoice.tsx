"use client";
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
      <h1 className="text-2xl font-bold my-3">Transaksi Terbaru</h1>
    <Table className=" rounded-lg">
      <TableHeader className="overflow-hidden">
        <TableRow className="bg-slate-100">
          <TableHead>Nomor Faktur</TableHead>
          <TableHead>Metode Pembayaran</TableHead>
          <TableHead>Tanggal</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow className="">
          <TableCell className="font-medium">INV001</TableCell>
          <TableCell>Paid</TableCell>
          <TableCell>Credit Card</TableCell>
          <TableCell>2024-01-01</TableCell>
          <TableCell className="text-right">Rp. 50.000</TableCell>
        </TableRow>
      </TableBody>
    </Table>
    </div>

  );
}
