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
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const where: any = {
      OR: [
        { material: { name: { contains: search } } },
        { unit: { name: { contains: search } } },
      ],
    };

    const materialUnit = await prisma.materialUnit.findMany({
      where,
      include: {
        material: true,
        unit: true,
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    });



    const total = await prisma.materialUnit.count({ where });
    const data = materialUnit.map((item) => ({  
      id: item.id,
      material_id: item.material.id,
      material: item.material.name,
      unit_id: item.unit.id,
      unit: item.unit.name,
      
    }));

    const options = {
      materials: await prisma.material.findMany(),
      units: await prisma.unit.findMany(),
    }
    return NextResponse.json({
      data,
      options,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({
      message: "Gagal mengambil data satuan material",
      error: error.message,
    }, { status: 500 });
  }
}


export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = parseInt(searchParams.get("id") || "0");
  await prisma.materialUnit.delete({ where: { id } });
  return NextResponse.json({ message: "Satuan bahan baku berhasil dihapus" }, { status: 200 });
}
