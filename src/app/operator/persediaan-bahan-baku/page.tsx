"use client";
import { useEffect } from "react";
import MainPage from "@/components/main";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Inventory from "./inventory/inventory";
import ListOrder from "./order/ListOrder";
import Entry from "./entry/Entry";

export default function PageStockMaterial() {
  useEffect(() => {
    document.title = "Persediaan Bahan Baku - Indera Distribution";
  }, []);

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
              <TabsTrigger value="entry">Entry Stok Bahan Baku</TabsTrigger>
              <TabsTrigger value="order">Preorder Bahan Baku</TabsTrigger>
            </TabsList>
            <TabsContent value="inventory">
              <Inventory />
            </TabsContent>
            <TabsContent value="entry">
              <Entry/>
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
