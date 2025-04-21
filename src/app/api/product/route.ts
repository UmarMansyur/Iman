/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/db";
import { ProductType } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "id";
    const sortOrder = searchParams.get("sortOrder") || "asc";
    const factoryId = searchParams.get("factoryId") || "";
    const factory_id = searchParams.get("factory_id") || "";
    // Buat where clause berdasarkan filter
    const where: any = {
      OR: [
        { name: { contains: search } },
      ],
    };

    if(factoryId) {
      where.factory_id = parseInt(factoryId);
    }

    if(factory_id) {
      where.factory_id = parseInt(factory_id);
    }

    if(search === ProductType.Gabus || search === ProductType.Kretek) {
      where.OR.push({ type: search })
    }
    // Hitung total records
    const total = await prisma.product.count({ where });

    // Ambil data dengan pagination
    const products = await prisma.product.findMany({
      where,
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        factory: true,
        // stockProducts: true,
      },
    });

    // ambil stock product dengan query RAW group by dengan product_id, dan type
    const stockProducts = await prisma.stockProduct.groupBy({
      by: ['type', 'product_id'],
      where: {
        product_id: {
          in: products.map(product => product.id)
        }
      },
      _sum: {
        amount: true
      },
    });


    const result = products.map((product) => {
      const stockIn = stockProducts.find((stock: any) => stock.product_id === product.id && stock.type === "In");
      const stockOut = stockProducts.find((stock: any) => stock.product_id === product.id && stock.type === "Out");
      return {
        ...product,
        stock_out: stockOut?._sum.amount || 0,
        stock_in: stockIn?._sum.amount || 0,
        stock: (stockIn?._sum.amount || 0) - (stockOut?._sum.amount || 0),
      };
    });

    return NextResponse.json({
      products: result,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id") || "";

  await prisma.product.delete({
    where: {
      id: parseInt(id as string)
    }
  })

  return NextResponse.json({ message: "Satuan berhasil dihapus" }, { status: 200 });
}