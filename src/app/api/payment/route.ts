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

    // Buat where clause berdasarkan filter
    const where: any = {
      OR: [
        { name: { contains: search } },
      ],
    };


    // Hitung total records
    const total = await prisma.paymentMethod.count({ where });

    // Ambil data dengan pagination
    const payments = await prisma.paymentMethod.findMany({
      where,
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({
      payments,
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

  await prisma.paymentMethod.delete({
    where: {
      id: parseInt(id as string)
    }
  })

  return NextResponse.json({ message: "Metode pembayaran berhasil dihapus" }, { status: 200 });
}
