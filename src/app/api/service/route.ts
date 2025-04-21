/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const search = searchParams.get("search") || "";
  const sortBy = searchParams.get("sortBy") || "id";
  const sortOrder = searchParams.get("sortOrder") || "desc";
  const factory_id = searchParams.get("factory_id") || "";
  const where: any = {
    OR: [
      {
        name: {
          contains: search,
        },
      },
    ],
  };

  if(factory_id) {
    where.factory_id = parseInt(factory_id);
  }

  try {
    const total = await prisma.service.count({ where });

    const data = await prisma.service.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    return NextResponse.json(
      {
        data: data,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


export async function POST(request: Request) {
  const { name, price, factory_id } = await request.json();
  if(!name || !price || !factory_id) {
    throw new Error("Invalid request")
  }

  try {
    const factory = await prisma.factory.findUnique({
      where: {
        id: parseInt(factory_id),
      }
    })
  
    if(!factory) {
      throw new Error("Pabrik tidak ditemukan!")
    }
  
    if(factory.status !== "Active") {
      throw new Error("Pabrik tidak aktif!, silahkan hubungi administrator untuk mengaktifkan pabrik ini!")
    }

    const existingLocation = await prisma.location.findFirst({
      where: {
        name,
        factory_id: parseInt(factory_id)
      }
    });

    if(existingLocation) {
      throw new Error("Layanan jasa sudah ada!")
    }

    const service = await prisma.service.create({
      data: {
        name, price: Number(price), factory_id: parseInt(factory_id)
      }
    })

    return NextResponse.json({message: "Layanan jasa berhasil dibuat!", data: service}, {status: 200})
  } catch (error: any) {
    return NextResponse.json({error: error.message}, {status: 500})
  }
}

