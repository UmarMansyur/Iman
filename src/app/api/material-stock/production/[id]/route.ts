/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/db";
import { MaterialStockStatus } from "@prisma/client";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: any }
) {
  const paramId = await params;
  const id = paramId.id;
  const body = await request.json();
  const { desc, user_id, details, total_amount, factory_id } = body;
  if (!factory_id) {
    return NextResponse.json(
      { message: "factory_id is required" },
      { status: 400 }
    );
  }
  if (!user_id) {
    return NextResponse.json(
      { message: "user_id is required" },
      { status: 400 }
    );
  }
  if (!details) {
    return NextResponse.json(
      { message: "details is required" },
      { status: 400 }
    );
  }
  try {
    // Pengecekan stok sebelum transaksi
    for (const detail of details) {
      const materialUnitId = parseInt(detail.material_unit_id);
      const requiredAmount = detail.amount;

      const materialStock = await prisma.materialStock.findFirst({
        where: {
          material_unit_id: materialUnitId,
          factory_id: parseInt(factory_id),
        },
      });

      if (!materialStock || materialStock.amount < requiredAmount) {
        return NextResponse.json(
          { message: `Insufficient stock for material unit ID: ${materialUnitId}` },
          { status: 400 }
        );
      }
    }

    const response = await prisma.$transaction(async (tx) => {
      await tx.materialStock.deleteMany({
        where: {
          report_material_stock_id: parseInt(id),
        },
      });

      await tx.detailReportMaterialStock.deleteMany({
        where: {
          report_material_stock_id: parseInt(id),
        },
      });

      // create materialStock juga
      await tx.materialStock.createMany({
        data: details.map((detail: any) => ({
          material_unit_id: parseInt(detail.material_unit_id),
          amount: detail.amount,
          factory_id: parseInt(factory_id),
          status: MaterialStockStatus.Out,
          report_material_stock_id: parseInt(id),
        })),
      });

      await tx.reportMaterialStock.update({
        where: {
          id: parseInt(id),
        },
        data: {
          desc,
          user_id: parseInt(user_id),
          total_amount,
          factory_id: parseInt(factory_id),
          DetailReportMaterialStock: {
            create: details.map((detail: any) => ({
              material_unit_id: parseInt(detail.material_unit_id),
              amount: detail.amount,
            })),
          },
        },
      });
    });
    return NextResponse.json(
      { message: "success", data: response },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
