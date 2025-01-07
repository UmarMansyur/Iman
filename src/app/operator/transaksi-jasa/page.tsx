import MainPage from "@/components/main";
import { Card, CardHeader, CardContent, CardDescription, CardFooter, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";
export default function TransaksiJasa() {
  return (
    <MainPage>
      <Card>
        <CardHeader>
          <CardTitle> Tambah Transaksi Jasa </CardTitle>
          <CardDescription> Isi data transaksi jasa dengan benar </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <Label> Nama Pembeli </Label>
              <Input type="text" placeholder="Nama Pembeli" />
            </div>
            <div className="flex flex-col gap-2">
              <Label> Nama Pembeli </Label>
              <Input type="text" placeholder="Nama Pembeli" />
            </div>
          </div>
        </CardContent>
      </Card>
    </MainPage>
  );
}
