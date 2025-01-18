/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const factoryId = searchParams.get("factory_id");

  try {
    // Ambil semua produk berdasarkan factory_id
    const products = await prisma.product.findMany({
      where: {
        factory_id: parseInt(factoryId || "0"),
      },
      distinct: ["id"],
    });

    const stockProduct = await prisma.stockProduct.groupBy({
      by: ["product_id", "type"],
      _sum: {
        amount: true,
      },
      where: {
        product_id: {
          in: products.map((product) => product.id),
        },
      },
    });

    const data = products.map((product) => {
      const stockIn = stockProduct.find(
        (stock) => stock.product_id === product.id && stock.type === "In"
      )?._sum.amount || 0;
      const stockOut = stockProduct.find(
        (stock) => stock.product_id === product.id && stock.type === "Out"
      )?._sum.amount || 0;
      const stock = stockIn - stockOut;
      // stock konvert ke karton sisanya ke bal sisanya ke slop/press dan sisanya ke pack
      
      const Karton = Math.floor(stock / (product.per_karton || 800));
      const balAmount = Math.floor((stock - (Karton * (product.per_karton || 800))) / (product.per_bal || 200));
      const pressAmount = Math.floor((stock - ((Karton * (product.per_karton || 800)) + (balAmount * (product.per_bal || 200)))) / (product.per_slop || 10));
      const packAmount = Math.floor(stock - ((Karton * (product.per_karton || 800)) + (balAmount * (product.per_bal || 200)) + (pressAmount * (product.per_slop || 10))));
      
      return {
        id: product.id,
        name: product.name,
        type: product.type,
        price: product.price,
        stock: stock,
        stock_pack: packAmount,
        stock_press: pressAmount,
        stock_bal: balAmount,
        stock_karton: Karton,
        sold: stockOut,
        per_bal: product.per_bal,
        per_karton: product.per_karton,
        per_slop: product.per_slop,
      };
    });

    // Hitung statistik untuk dashboard
    const statistics = {
      totalProducts: data.length,
      totalAvailableStock: data.reduce((acc, item) => acc + item.stock, 0),
      totalSoldStock: data.reduce((acc, item) => acc + item.sold, 0),
      totalProductValue: data.reduce(
        (acc, item) => acc + item.price * item.stock,
        0
      ),
    };

    return NextResponse.json({
      data,
      statistics,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message || "Terjadi kesalahan saat mengambil data",
        details: error,
      },
      { status: 500 }
    );
  }
}
