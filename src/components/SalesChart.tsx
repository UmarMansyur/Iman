"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type SalesData = {
  bulan: string;
  penjualan: number;
  produksi: number;
};

interface SalesChartProps {
  data: SalesData[];
}

export default function SalesChart({ data }: SalesChartProps) {
  return (
    <Card className="mt-4 border-none shadow-none p-0 m-0">
      <CardHeader>
        <CardTitle>Grafik Penjualan dan Produksi</CardTitle>
      </CardHeader>
      <CardContent className="h-[500px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <defs>
              <linearGradient id="colorPenjualan" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4169E1" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#4169E1" stopOpacity={0.9}/>
              </linearGradient>
              <linearGradient id="colorProduksi" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7FFFD4" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#48D1CC" stopOpacity={0.9}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="bulan" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="penjualan" fill="url(#colorPenjualan)" />
            <Bar dataKey="produksi" fill="url(#colorProduksi)" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
} 