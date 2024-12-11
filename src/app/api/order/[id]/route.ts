/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { OrderMaterialUnitStatus } from "@prisma/client";

interface RouteParams {
  params: {
    id: string;
  };
}

// PUT - Update order
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status, total_item_received, desc, details } = body;

    // Update order and its details in a transaction
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Update main order
      await tx.orderMaterialUnit.update({
        where: { id: parseInt(id) },
        data: {
          status,
          total_item_received,
          desc,
        },
      });

      // Update details if provided
      if (details && details.length > 0) {
        // Delete existing details not in the new array
        await tx.detailOrderMaterialUnit.deleteMany({
          where: {
            order_material_unit_id: parseInt(id),
            id: {
              notIn: details.filter((d: any) => d.id).map((d: any) => d.id),
            },
          },
        });

        // Update or create details
        for (const detail of details) {
          if (detail.id) {
            await tx.detailOrderMaterialUnit.update({
              where: { id: detail.id },
              data: {
                material_unit_id: parseInt(detail.material_unit_id),
                amount: detail.amount,
                price: detail.price,
                status: detail.status,
              },
            });
          } else {
            await tx.detailOrderMaterialUnit.create({
              data: {
                order_material_unit_id: parseInt(id),
                material_unit_id: parseInt(detail.material_unit_id),
                amount: detail.amount,
                price: detail.price,
                status: OrderMaterialUnitStatus.Pending,
              },
            });
          }
        }
      }

      // Fetch updated order with details
      return await tx.orderMaterialUnit.findUnique({
        where: { id: parseInt(id) },
        include: {
          DetailOrderMaterialUnit: {
            include: {
              materialUnit: true,
            },
          },
        },
      });
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Update order error:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}

// GET single order
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = params;

    const order = await prisma.orderMaterialUnit.findUnique({
      where: { id: parseInt(id) },
      include: {
        factory: true,
        DetailOrderMaterialUnit: {
          include: {
            materialUnit: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch order" },
      { status: 500 }
    );
  }
}
