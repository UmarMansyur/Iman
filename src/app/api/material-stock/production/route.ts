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
    const factoryId = parseInt(searchParams.get("factoryId") || "0");

    const where: any = {
      // status: MaterialStockStatus.Out,
      OR: [
        {
          DetailReportMaterialStock: {
            some: {
              materialUnit: {
                material: {
                  name: { contains: search }
                }
              }
            }
          }
        },
      ],
      factory_id: factoryId || undefined,
    };

    const materialStock = await prisma.reportMaterialStock.findMany({
      where: {
        factory_id: factoryId || undefined,
        ...where,
      },
      include: {
        user: true,
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
    });

    const data = materialStock.map((item) => ({
      ...item,
      tanggal: new Date(item.created_at).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
      operator: item.user.username,
      detail: item.DetailReportMaterialStock.map((detail) => ({
        material_unit: detail.materialUnit.material.name,
        unit: detail.materialUnit.unit.name,
        amount: detail.amount,
      })),
    }));

 
    const total = await prisma.reportMaterialStock.count({ where });

    return NextResponse.json({
      data: data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { desc, user_id, details, total_amount, factory_id } = body;

    // Validasi stok untuk semua material
    for (const detail of details) {
      const availableStock = await prisma.materialStock.aggregate({
        where: {
          material_unit_id: Number(detail.material_unit_id),
          status: MaterialStockStatus.In,
        },
        _sum: { amount: true },
      });

      const currentStock = availableStock._sum.amount || 0;
      const requestedAmount = Number(detail.amount);

      if (requestedAmount > currentStock) {
        const materialUnit = await prisma.materialUnit.findUnique({
          where: { id: Number(detail.material_unit_id) },
          include: {
            material: true,
            unit: true,
          }
        });
        return NextResponse.json(
          { 
            message: "Stok tidak mencukupi untuk : " + materialUnit?.material.name + " / " + materialUnit?.unit.name + ". Stok tersedia: " + currentStock + " " + materialUnit?.unit.name
          },
          { status: 400 }
        );
      }
    }

    // Buat laporan penggunaan
    const report = await prisma.reportMaterialStock.create({
      data: {
        factory_id: Number(factory_id), // Sesuaikan dengan factory_id yang sesuai
        total_amount: Number(total_amount),
        desc: desc,
        user_id: Number(user_id),
        DetailReportMaterialStock: {
          create: details.map((detail: any) => ({
            material_unit_id: Number(detail.material_unit_id),
            amount: Number(detail.amount)
          }))
        }
      }
    });

    // Buat record penggunaan bahan baku untuk setiap detail
    await Promise.all(
      details.map((detail: any) =>
        prisma.materialStock.create({
          data: {
            factory_id: Number(factory_id), // Sesuaikan dengan factory_id yang sesuai
            material_unit_id: Number(detail.material_unit_id),
            amount: Number(detail.amount),
            status: MaterialStockStatus.Out,
            report_material_stock_id: report.id,
          },
        })
      )
    );

    return NextResponse.json(
      { 
        message: "Penggunaan bahan baku berhasil dilaporkan",
        data: report 
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        message: error.message || "Gagal melaporkan penggunaan bahan baku",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = parseInt(searchParams.get("id") || "0");
  const exist = await prisma.reportMaterialStock.findUnique({ where: { id } });
  if (!exist) {
    return NextResponse.json(
      { message: "Laporan tidak ditemukan" },
      { status: 404 }
    );
  }
  // tolong hapus juga record di materialStock dimana report_material_idnya adalah id yang dihapus
  const response = await prisma.$transaction(async (tx) => {
    await tx.materialStock.deleteMany({ where: { report_material_stock_id: id } });
    await tx.reportMaterialStock.delete({ where: { id } });
  });
  return NextResponse.json(
    { message: "Laporan berhasil dihapus", data: response },
    { status: 200 }
  );
}
