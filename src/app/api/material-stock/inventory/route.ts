/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { MaterialStockStatus } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const factoryId = searchParams.get("factoryId");

    const where: any = {
      OR: [
        { materialUnit: { material: { name: { contains: search } } } },
        { factory: { name: { contains: search } } },
        { materialUnit: { unit: { name: { contains: search } } } },
      ],
      ...(factoryId && { factory_id: parseInt(factoryId) }),
    };

    const materialId = await prisma.materialStock.groupBy({
      by: ['material_unit_id'],
      _sum: {
        amount: true,
      },
      where: {
        status: MaterialStockStatus.In,
        ...(factoryId && { factory_id: parseInt(factoryId) }),
      },
    });

    const outMaterialUnit = await prisma.materialStock.groupBy({
      by: ['material_unit_id'],
      _sum: {
        amount: true,
      },
      where: {
        status: MaterialStockStatus.Out,
        ...(factoryId && { factory_id: parseInt(factoryId) }),
      },
    });

    const materialUnit = await prisma.materialStock.findMany({
      where: {
        ...where,
        material_unit_id: {
          in: materialId.map((item) => item.material_unit_id),
        },
      },
      include: {
        materialUnit: {
          include: {
            material: true,
            unit: true,
          },
        },
        factory: true,
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [
        {
          materialUnit: {
            material: {
              name: sortOrder as "asc" | "desc"
            }
          }
        },
        {
          materialUnit: {
            unit: {
              name: sortOrder as "asc" | "desc"
            }
          }
        }
      ],
      distinct: ['material_unit_id'],
    });

    const data = materialUnit.map((item: any) => ({
      id: item.id,
      material_unit: item.materialUnit.material.name,
      unit: item.materialUnit.unit.name,
      amount: (materialId.find((material) => material.material_unit_id === item.material_unit_id)?._sum.amount || 0) - (outMaterialUnit.find((material) => material.material_unit_id === item.material_unit_id)?._sum.amount || 0),
      status: item.status,
    }));

    const total = await prisma.materialStock.count({ where });

    return NextResponse.json(
      {
        data,
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
    return NextResponse.json(
      {
        message: error.message
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const formData = await request.formData();
    const {
      id,
      amount,
      status,
    } = Object.fromEntries(formData);

    // Check if record exists first
    const existingStock = await prisma.materialStock.findUnique({
      where: { id: Number(id) }
    });

    if (!existingStock) {
      return NextResponse.json(
        { message: "Data stok bahan baku tidak ditemukan" },
        { status: 404 }
      );
    }

    // Calculate total amount for this specific material
    const stockTotal = await prisma.materialStock.aggregate({
      where: { 
        material_unit_id: existingStock.material_unit_id,
        status: MaterialStockStatus.In,
        NOT: { id: Number(id) }  // Exclude current record
      },
      _sum: { amount: true }
    });

    let newAmount = (stockTotal._sum.amount || 0);
    
    // Add or subtract based on status
    if (status === MaterialStockStatus.In) {
      newAmount += Number(amount);
    } else {
      newAmount -= Number(amount);
      
      // Prevent negative stock
      if (newAmount < 0) {
        // return NextResponse.json(
        //   { message: "Stok tidak mencukupi untuk pengurangan" },
        //   { status: 400 }
        // );
        throw new Error("Stok tidak mencukupi untuk pengurangan")
      }
    }

    await prisma.materialStock.update({
      where: { id: Number(id) },
      data: {
        status: status as MaterialStockStatus,
        amount: newAmount,
      },
    });
    return NextResponse.json(
      { message: "Data stok bahan baku berhasil diubah" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        message: "Gagal mengubah data stok bahan baku",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
