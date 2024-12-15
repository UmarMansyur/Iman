/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { OrderMaterialUnitStatus, MaterialStockStatus } from "@prisma/client";


export async function PUT(request: Request, { params }: any) {
  try {
    const paramsId = await params;
    const id = paramsId.id;
    const body = await request.json();
    const { status } = body;

    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Update status order utama
      const order = await tx.orderMaterialUnit.update({
        where: { id: parseInt(id) },
        data: {
          status: status as OrderMaterialUnitStatus,
        },
      });

      // Jika status Approved, buat material stock entries
      if (status === OrderMaterialUnitStatus.Approved) {
        // Ambil detail order
        const orderDetails = await tx.detailOrderMaterialUnit.findMany({
          where: { order_material_unit_id: parseInt(id) },
        });

        // Buat material stock untuk setiap detail
        const stockEntries = orderDetails.map((detail) => ({
          factory_id: order.factory_id,
          material_unit_id: detail.material_unit_id,
          amount: detail.amount,
          status: MaterialStockStatus.In,
          order_material_unit_id: parseInt(id),
        }));

        await tx.materialStock.createMany({
          data: stockEntries,
        });

        // Update status semua detail order
        await tx.detailOrderMaterialUnit.updateMany({
          where: { order_material_unit_id: parseInt(id) },
          data: { status: status as OrderMaterialUnitStatus },
        });
      }

      // Ambil order yang sudah diupdate beserta detailnya
      return await tx.orderMaterialUnit.findUnique({
        where: { id: parseInt(id) },
        include: {
          factory: true,
          DetailOrderMaterialUnit: {
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
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Update order status error:", error);
    return NextResponse.json(
      { error: "Gagal mengupdate status order" },
      { status: 500 }
    );
  }
}
