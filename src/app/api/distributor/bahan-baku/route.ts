/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const page = searchParams.get("page") || "1";
  const limit = searchParams.get("limit") || "10";
  const user_id = searchParams.get("user_id") || "";
  const skip = (Number(page) - 1) * Number(limit);

  try {
    const memberFactory = await prisma.memberDistributor.findFirst({
      where: {
        user_id: Number(user_id),
      },
    });

    if (!memberFactory) {
      throw new Error("Member factory not found");
    }

    const where: any = {
      factory_distributor_id: memberFactory?.factory_distributor_id,
    };

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
          },
        },
        {
          unit: {
            name: {
              contains: search,
            },
          },
        },
      ];
    }

    const materials = await prisma.materialDistributor.findMany({
      where,
      include: {
        unit: true,
      },
      skip,
      take: Number(limit),
    });

    const options = await prisma.unit.findMany();

    const total = await prisma.materialDistributor.count({
      where,
    });

    const total_satuan = await prisma.unit.count();

    return NextResponse.json({
      message: "Berhasil, bahan baku berhasil diambil",
      data: materials,
      options: {
        units: options,
      },
      pagination: {
        total,
        total_satuan: total_satuan,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      message: error.message,
      error: error,
    });
  }
}

export async function POST(req: Request) {
  const { name, unit_id, user_id } = await req.json();
  try {

    if(!name) {
      throw new Error("Nama bahan baku tidak boleh kosong");
    }

    if(!unit_id) {
      throw new Error("Satuan bahan baku tidak boleh kosong");
    }

    const memberFactory = await prisma.memberDistributor.findFirst({
      where: {
        user_id: Number(user_id),
      },
    });

    if (!memberFactory) {
      throw new Error("Member factory not found");
    }

    const exist = await prisma.materialDistributor.findFirst({
      where: {
        name,
        factory_distributor_id: memberFactory.factory_distributor_id,
        unit_id: Number(unit_id),
      },
    });

    if (exist) {
      throw new Error("Bahan baku sudah ada");
    }

    const material = await prisma.materialDistributor.create({
      data: {
        name,
        unit_id: Number(unit_id),
        factory_distributor_id: memberFactory.factory_distributor_id,
      },
    });

    return NextResponse.json({
      message: "Berhasil, bahan baku berhasil dibuat",
      data: material,
    }, {
      status: 201,
    });
  } catch (error: any) {
    return NextResponse.json({
      message: error.message,
      error: error,
    }, {
      status: 400,
    });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if(!id) {
      throw new Error("Id bahan baku tidak boleh kosong");
    }
    const existMaterial = await prisma.materialDistributor.findFirst({
      where: {
        id: Number(id),
      },
    });
    if(!existMaterial) {
      throw new Error("Bahan baku tidak ditemukan");
    }

    const result = await prisma.materialDistributor.delete({
      where: {
        id: Number(id),
      },
    });

    return NextResponse.json({
      message: "Berhasil, bahan baku berhasil dihapus",
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json({
      message: error.message,
      error: error,
    });
  }
}