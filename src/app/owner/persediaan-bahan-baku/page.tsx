import MainPage from "@/components/main";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Inventory from "./inventory/inventory";
import ListOrder from "./order/ListOrder";

export default function PageStockMaterial() {
  return (
    <MainPage>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-bold">Persediaan Bahan Baku</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="inventory">
            <TabsList>
              <TabsTrigger value="inventory">Persediaan Bahan Baku</TabsTrigger>
              <TabsTrigger value="order">Data Order</TabsTrigger>
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
