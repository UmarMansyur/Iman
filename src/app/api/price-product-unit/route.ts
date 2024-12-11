/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "id";
    const sortOrder = searchParams.get("sortOrder") || "asc";
    const factoryId = searchParams.get("factoryId") || undefined;
    // Buat where clause berdasarkan filter
    const where: any = {
      OR: [
        { productUnit: { product: { name: { contains: search } } } }, // Filter berdasarkan nama produk
        { productUnit: { unit: { name: { contains: search } } } },   // Filter berdasarkan nama unit
      ],
      productUnit: {
        factoryId: factoryId ? parseInt(factoryId) : undefined,
      }
    };

    // Hitung total records
    const total = await prisma.priceProductUnit.count({ where });

    // Ambil data dengan pagination
    const priceProductUnits = await prisma.priceProductUnit.findMany({
      where,
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        productUnit: {
          include: {
            product: true,
            unit: true,
          }
        }
      },
    });

    const result = priceProductUnits.map((item: any) => {
      return {
        ...item,
        product: undefined,
        unit: undefined,
        product_satuan: item.productUnit.product.name,
        unit_satuan: item.productUnit.unit.name,
        amount: item.productUnit.amount,
        price: item.price,
        sale_price: item.sale_price,
        product_unit_id: item.productUnit.id,
        productUnit: undefined,
      }
    })

    const productUnits = await prisma.productUnit.findMany({
      include: {
        product: true,
        unit: true,
      },
      where: {
        factoryId: factoryId ? parseInt(factoryId) : undefined,
      }
    });

    
    return NextResponse.json({
      priceProductUnits: result,
      options: {
        products: productUnits.map((item: any) => {
          return {
            id: item.id,
            name: item.product.name + "/" + item.unit.name,
            amount: item.amount,
          }
        }),
      },
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

  try {
    await prisma.priceProductUnit.delete({
      where: {
        id: parseInt(id as string),
      },
    });

    return NextResponse.json({ message: "Harga produk berhasil dihapus" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
