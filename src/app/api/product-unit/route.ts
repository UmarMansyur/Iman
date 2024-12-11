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
    const productId = searchParams.get("productId") || "";
    const factoryId = searchParams.get("factoryId") || "";

    // Buat where clause berdasarkan filter
    const where: any = {
      OR: [
        { product: { name: { contains: search } } }, // Filter berdasarkan nama produk
        { unit: { name: { contains: search } } },   // Filter berdasarkan nama unit
      ],
      factoryId: factoryId ? parseInt(factoryId) : undefined,
    };

    if (productId) {
      where.product_id = parseInt(productId);
    }

    if (factoryId) {
      where.factoryId = parseInt(factoryId);
    }

    // Hitung total records
    const total = await prisma.productUnit.count({ where });

    // Ambil data dengan pagination
    const productUnits = await prisma.productUnit.findMany({
      where,
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        product: true, // Include data relasi product
        unit: true,   // Include data relasi unit
      },
    });

    const products = await prisma.product.findMany();
    const units = await prisma.unit.findMany();
    const result = await Promise.all(productUnits.map(async(productUnit) => ({
      ...productUnit,
      product: productUnit.product.name,
      unit: productUnit.unit.name,
      parent: productUnit.parent_id ? await prisma.unit.findUnique({ where: { id: productUnit.parent_id } }) : null,
    })));
    
    return NextResponse.json({
      productUnits: result,
      options: {
        products: products,
        units: units,
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
    await prisma.productUnit.delete({
      where: {
        id: parseInt(id as string),
      },
    });

    return NextResponse.json({ message: "Satuan produk berhasil dihapus" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
