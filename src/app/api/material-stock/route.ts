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
    const validSortFields = ["id", "tanggal", "Operator", "total_amount", "desc"];
    const sortBy = validSortFields.includes(searchParams.get("sortBy") || "") 
      ? searchParams.get("sortBy") 
      : "tanggal";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";
    const factoryId = parseInt(searchParams.get("factoryId") || "0");

 

    const where: any = {
      ...(factoryId ? { factory_id: factoryId } : {}),
      ...(search ? {
        OR: [
          { user: { username: { contains: search } } },
          { user: { email: { contains: search } } },
          { desc: { contains: search } }
        ]
      } : {})
    };

    const orderBy: any = 
    sortBy === "user" 
      ? { user_id: sortOrder }
      : sortBy === "tanggal"
      ? { created_at: sortOrder }
      : sortBy === "total_amount"
      ? { total_amount: sortOrder }
      : sortBy === "desc"
      ? { desc: sortOrder }
      : { created_at: "desc" };


    const materialStock = await prisma.reportMaterialStock.findMany({
      where,
      include: {
        user: true,
        factory: true,
        DetailReportMaterialStock: {
          include: {
            materialUnit: {
              include: {
                material: true,
                unit: true,
              },
            },
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: orderBy,
    });

    const total = await prisma.reportMaterialStock.count({ where });
    
    return NextResponse.json(
      {
        data: materialStock,
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
        message: error.message,
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
      amount_morning,
      amount_afternoon,
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
      newAmount += Number(amount_morning || 0) + Number(amount_afternoon || 0);
    } else {
      newAmount -= Number(amount_morning || 0) + Number(amount_afternoon || 0);
      
      // Prevent negative stock
      if (newAmount < 0) {
        // return NextResponse.json(
        //   { message: "Stok tidak mencukupi untuk pengurangan" },
        //   { status: 400 }
        // );
        throw new Error("Stok tidak mencukupi untuk pengurangan");
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

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = parseInt(searchParams.get("id") || "0");
  await prisma.materialUnit.delete({ where: { id } });
  return NextResponse.json(
    { message: "Satuan bahan baku berhasil dihapus" },
    { status: 200 }
  );
}
