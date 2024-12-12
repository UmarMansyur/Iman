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
    // Buat where clause berdasarkan filter
    const where: any = {
      OR: [
        { name: { contains: search } },
      ],
    };

    if(factoryId) {
      where.factory_id = parseInt(factoryId);
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
        stockProducts: true,
      },
    });

    const result = products.map((product) => {
      return {
        ...product,
        stock: product.stockProducts.reduce((acc, curr) => acc + curr.amount, 0),
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