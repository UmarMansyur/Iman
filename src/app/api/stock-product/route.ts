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
      select: {
        id: true,
        name: true,
        type: true,
        price: true,
      },
      distinct: ["id"],
    });

    const stockProduct = await prisma.stockProduct.groupBy({
      by: ["product_id"],
      _sum: {
        amount: true,
      },
      where: {
        product_id: {
          in: products.map((product) => product.id),
        },
        type: "In",
      },
    });

    const soldProduct = await prisma.stockProduct.groupBy({
      by: ["product_id"],
      _sum: {
        amount: true,
      },
      where: {
        product_id: {
          in: products.map((product) => product.id),
        },
        type: "Out",
      },
    });

    const data = products.map((product) => {
      const stock =
        stockProduct.find((stock) => stock.product_id === product.id)?._sum
          .amount || 0;
      const sold =
        soldProduct.find((sold) => sold.product_id === product.id)?._sum
          .amount || 0;
          // stock konvert ke karton sisanya ke bal sisanya ke slop/press dan sisanya ke pack
      
      const Karton = Math.floor(stock / 800);
      const balAmount = stock - Karton * 800;
      const pressAmount = Math.floor(balAmount / 200);
      const packAmount = balAmount - pressAmount * 200;
      

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
        sold: sold,
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
