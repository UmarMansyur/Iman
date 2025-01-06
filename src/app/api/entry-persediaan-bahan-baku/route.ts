/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/db";
import { OrderMaterialUnitStatus } from "@prisma/client";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { factory_id, desc, details, user_id, type_preorder = false } = body;
    const total_item = details.reduce(
      (sum: number, detail: any) => sum + detail.amount,
      0
    );
    const total_price = details.reduce(
      (sum: number, detail: any) => sum + detail.amount * detail.price,
      0
    );

    const order = await prisma.$transaction(async (tx) => {
      const orderMaterialUnit = await tx.orderMaterialUnit.create({
        data: {
          factory_id: parseInt(factory_id),
          amount: total_item,
          price: total_price,
          total_item,
          desc,
          type_preorder: type_preorder,
          status: 'Approved',
          user_id: parseInt(user_id),
          DetailOrderMaterialUnit: {
            create: details.map((detail: any) => ({
              material_unit_id: parseInt(detail.material_unit_id),
              amount: detail.amount,
              price: detail.price,
              status: OrderMaterialUnitStatus.Pending,
              amount_received: detail.amount
            })),
          },
        },
        include: {
          DetailOrderMaterialUnit: true,
        },
      });

      if (!type_preorder) {
        const detailsToCreate = details.map((detail: any) => ({
          material_unit_id: parseInt(detail.material_unit_id),
          amount: detail.amount,
          factory_id: parseInt(factory_id),
          report_material_stock_id: orderMaterialUnit.id,
          order_material_unit_id: orderMaterialUnit.id,
        }));

        await tx.materialStock.createMany({
          data: detailsToCreate,
        });
      }

      return orderMaterialUnit;
    });

    return NextResponse.json(order);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}