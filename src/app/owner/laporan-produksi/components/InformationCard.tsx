/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Box } from "lucide-react";

interface InformationCardProps {
  data: any;
}

export default function InformationCard({ data }: InformationCardProps) {
  const informations = [
    {
      title: "Total Produksi",
      description: "Total Produksi Produk Bulan Ini",
      value: data.total_produksi_bulan,
    },
    {
      title: "Total Produksi",
      description: "Total Produksi Produk Minggu Ini",
      value: data.total_produksi_minggu,
    },
    {
      title: "Total Produksi",
      description: "Total Produksi Produk Hari Ini",
      value: data.total_produksi_hari,
    },
  ];
  return informations.map((information, index) => (
    <Card key={index}>
      <CardHeader className="p-4">
        <CardTitle>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Box className="w-4 h-4" /> {information.title}
              </h3>
              <p className="text-sm text-gray-500">{information.description}</p>
            </div>
            <div className="flex items-center gap-2">
              {new Intl.NumberFormat('id-ID', { style: 'decimal', currency: 'IDR' }).format(Number(information.value))} / Pack
              </div>
          </div>
        </CardTitle>
      </CardHeader>
    </Card>
  ));
}
