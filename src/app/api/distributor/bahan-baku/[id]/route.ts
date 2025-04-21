/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: { params: any }) {
  const { id } = await params;
  const { name, unit_id } = await req.json();

  try {
    const existMaterial = await prisma.materialDistributor.findFirst({
      where: {
        id: Number(id),
      },
    });

    if (!existMaterial) {
      throw new Error("Bahan baku tidak ditemukan");
    }

    const existUnit = await prisma.unit.findFirst({
      where: {
        id: Number(unit_id),
      },
    });

    if (!existUnit) {
      throw new Error("Unit tidak ditemukan");
    }

    const exist = await prisma.materialDistributor.findFirst({
      where: {
        name,
        unit_id: Number(unit_id),
        factory_distributor_id: existMaterial.factory_distributor_id,
        NOT: {
          id: Number(id),
        },
      },
    });

    if (exist) {
      throw new Error("Bahan baku sudah ada");
    }

    const material = await prisma.materialDistributor.update({
      where: { id: Number(id) },
      data: {
        name,
        unit_id: Number(unit_id),
        factory_distributor_id: existMaterial.factory_distributor_id,
      },
    });

    return NextResponse.json({
      message: "Berhasil, bahan baku berhasil diubah",
      data: material,
    });
  } catch (error: any) {
    return NextResponse.json({
      message: error.message,
      error: error,
    });
  }
}

export async function DELETE(req: Request, { params }: { params: any }) {
  const { id } = await params;

  try {
    const material = await prisma.materialDistributor.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({
      message: "Berhasil, bahan baku berhasil dihapus",
      data: material,
    });
  } catch (error: any) {
    return NextResponse.json({
      message: error.message,
      error: error,
    });
  }
}
