/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const factory_id = searchParams.get("factory_id") || undefined;
  const search = searchParams.get("search") || undefined;
  const sortBy = searchParams.get("sortBy") || "created_at";
  const sortOrder = searchParams.get("sortOrder") || "desc";
  const page = searchParams.get("page") || "1";
  const limit = searchParams.get("limit") || "10";

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const where: any = {};

  if (factory_id) {
    where.factory_id = factory_id;
  }

  if (factory_id == "undefined") {
    delete where.factory_id;
  }

  if (search) {
    where.name = {
      contains: search,
      mode: "insensitive",
    };
  }

  try {
    const options = await prisma.factory.findMany({
      where: {
        status: "Active",
      },
    });

    const distributors = await prisma.factoryDistributor.findMany({
      where,
      skip,
      include: {
        Factory: true,
      },
      take,
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    const total = await prisma.factoryDistributor.count({
      where,
    });

    return NextResponse.json({
      data: distributors,
      options,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const data = await request.json();

  try {
    if (!data.name) {
      throw new Error("Nama distributor harus diisi");
    }

    if (!data.factory_id) {
      throw new Error("Pabrik harus diisi");
    }

    console.log(data);
  
    const existingDistributor = await prisma.factoryDistributor.findFirst({
      where: {
        name: data.name,
        factoryId: Number(data.factory_id),
      },
    });
  
    if (existingDistributor) {
      throw new Error("Distributor sudah ada");
    } 
  
    const distributor = await prisma.factoryDistributor.create({
      data: {
        name: data.name,
        factoryId: Number(data.factory_id),
      }
    });

    return NextResponse.json({
      message: "Distributor berhasil dibuat",
      data: distributor,
    });
  } catch (error: any) {
    console.log(error);
    return NextResponse.json(
      { message: error.message || "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
