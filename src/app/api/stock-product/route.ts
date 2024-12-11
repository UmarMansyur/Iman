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
      }
    });

    // Ambil total stok masuk (In)
    const stockIn = await prisma.reportProduct.groupBy({
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

    // Ambil total stok keluar (Out)
    const stockOut = await prisma.reportProduct.groupBy({
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

    // Gabungkan data
    const data = products.map((product) => {
      const totalStockIn = stockIn.find((stock) => stock.product_id === product.id)?._sum.amount || 0;
      const totalStockOut = stockOut.find((stock) => stock.product_id === product.id)?._sum.amount || 0;
      
      return {
        id: product.id,
        name: product.name,
        type: product.type,
        price: product.price,
        soldStock: totalStockOut,
        availableStock: totalStockIn - totalStockOut,
      };
    });

    // Hitung statistik untuk dashboard
    const statistics = {
      totalProducts: data.length,
      totalAvailableStock: data.reduce((acc, item) => acc + item.availableStock, 0),
      totalSoldStock: data.reduce((acc, item) => acc + item.soldStock, 0),
      totalProductValue: data.reduce((acc, item) => acc + (item.price * item.availableStock), 0),
    };

    return NextResponse.json({
      data,
      statistics,
    });
    
  } catch (error) {
    return NextResponse.json({ 
      error: "Terjadi kesalahan saat mengambil data",
      details: error 
    }, { status: 500 });
  }
}

