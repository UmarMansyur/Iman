"use client";
import { useEffect } from "react";
import MainPage from "@/components/main";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ListOrder from "./order/ListOrder";
import Entry from "./entry/Entry";

export default function PageStockMaterial() {
  useEffect(() => {
    document.title = "Persediaan Bahan Baku - Indera Distribution";
  }, []);

  return (
    <MainPage>
      <div>
        <h1 className="text-base font-bold">Order Bahan Baku</h1>
        <p className="text-sm text-gray-500">
          Order bahan baku adalah proses pemesanan bahan baku dari pabrik ke distributor.
        </p>
      </div>
      <Tabs defaultValue="entry">
        <TabsList>
          <TabsTrigger value="entry">Entry Stok Bahan Baku</TabsTrigger>
          <TabsTrigger value="order">Preorder Bahan Baku</TabsTrigger>
        </TabsList>
        <TabsContent value="entry">
          <Entry />
        </TabsContent>
        <TabsContent value="order">
          <ListOrder />
        </TabsContent>
      </Tabs>

    </MainPage>
  );
}
