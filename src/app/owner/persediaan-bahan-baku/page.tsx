import MainPage from "@/components/main";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Inventory from "./inventory/inventory";
import ListOrder from "./order/ListOrder";

export default function PageStockMaterial() {
  return (
    <MainPage>
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold">Persediaan Bahan Baku</CardTitle>
          <CardDescription>
            <p>
              Selama status order bahan baku belum diterima, maka bahan baku tidak akan ditambahkan ke persediaan bahan baku.
            </p>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="inventory">
            <TabsList>
              <TabsTrigger value="inventory">Stok Bahan Baku</TabsTrigger>
              <TabsTrigger value="order">Order Bahan Baku</TabsTrigger>
            </TabsList>
            <TabsContent value="inventory">
              <Inventory />
            </TabsContent>
            <TabsContent value="order">
              <ListOrder/>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </MainPage>
  );
}
