/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "Semua";
    const sortBy = searchParams.get("sortBy") || "created_at";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Buat where clause berdasarkan filter
    const where: any = {
      OR: [
        { nickname: { contains: search } },
        { name: { contains: search } },
        { address: { contains: search } },
      ],
    };

    // Filter berdasarkan status
    if (status !== "Semua") {
      switch (status) {
        case "Aktif":
          where.status = "Active";
          break;
        case "Tidak Aktif":
          where.status = "Inactive";
          break;
        case "Belum Verifikasi":
          where.status = "Pending";
          break;
        case "Ditangguhkan":
          where.status = "Suspended";
          break;
      }
    }

    // Hitung total records
    const total = await prisma.factory.count({ where });

    // Ambil data dengan pagination
    const factories = await prisma.factory.findMany({
      where,
      include: {
        user: true,
        memberFactories: {
          include: {
            factory: true,
            user: true,
          }
        }
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const result = factories.map((factory) => {
      return {
        ...factory,
        // user: factory.user,
        member_user: factory.memberFactories.map((memberFactory) => memberFactory.user.username),
      };
    });


    return NextResponse.json({
      factories: result,
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

  await prisma.factory.delete({
    where: {
      id: parseInt(id as string)
    }
  })

  return NextResponse.json({ message: "Pabrik berhasil dihapus" }, { status: 200 });
}