/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/db";
import { OrderMaterialUnitStatus } from "@prisma/client";
import { NextResponse } from "next/server";

export async function PUT(request: Request, { params }: { params: any }) {
  try {
    const param = await params;
    const id = param.id;
    const body = await request.json();
    const { factory_id, desc, details, user_id } = body;
    const total_item = details.reduce(
      (sum: number, detail: any) => sum + detail.amount,
      0
    );
    const total_price = details.reduce(
      (sum: number, detail: any) => sum + detail.amount * detail.price,
      0
    );

    const order = await prisma.$transaction(async (tx) => {
      await tx.detailOrderMaterialUnit.deleteMany({
        where: {
          order_material_unit_id: parseInt(id),
        },
      });

      const orderMaterialUnit = await tx.orderMaterialUnit.update({
        where: {
          id: parseInt(id),
        },
        data: {
          factory_id: parseInt(factory_id),
          amount: total_item,
          price: total_price,
          total_item,
          desc,
          type_preorder: false,
          status: "Approved",
          user_id: parseInt(user_id),
          DetailOrderMaterialUnit: {
            create: details.map((detail: any) => ({
              material_unit_id: parseInt(detail.material_unit_id),
              amount: detail.amount,
              price: detail.price,
              status: OrderMaterialUnitStatus.Pending,
              amount_received: detail.amount,
            })),
          },
        },
        include: {
          DetailOrderMaterialUnit: true,
        },
      });

      const detailsToCreate = details.map((detail: any) => ({
        material_unit_id: parseInt(detail.material_unit_id),
        amount: detail.amount,
        factory_id: parseInt(factory_id),
        order_material_unit_id: orderMaterialUnit.id,
      }));

      await tx.materialStock.deleteMany({
        where: {
          order_material_unit_id: orderMaterialUnit.id,
        },
      });

      await tx.materialStock.createMany({
        data: detailsToCreate,
      });

      return orderMaterialUnit;
    });

    return NextResponse.json(order);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


export async function GET(request: Request, { params }: { params: any }) {
  try {
    const paramId = await params;
    const id = paramId.id;

    const order = await prisma.orderMaterialUnit.findUnique({
      where: {
        id: parseInt(id),
      },
      include: {
        DetailOrderMaterialUnit: {
          include: {
            materialUnit: {
              include: {
                material: true,
                unit: true,
              },
            },
            orderMaterialUnit: true,
          },
        },
        user: true,
        factory: true,
      },
    });

    if (!order) {
      return Response.json({ error: "Order tidak ditemukan" }, { status: 404 });
    }

    return Response.json(order);
  } catch (error: any) {
    return Response.json(
      { error: error.message || "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
