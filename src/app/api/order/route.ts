/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/order-material/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { OrderMaterialUnitStatus } from "@prisma/client";

// GET - Fetch all orders
export async function GET() {
  try {
    const orders = await prisma.orderMaterialUnit.findMany({
      include: {
        factory: true,
        DetailOrderMaterialUnit: {
          include: {
            materialUnit: true,
          },
        },
      },
    });

    return NextResponse.json(orders);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// POST - Create new order
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { factory_id, desc, details } = body;

    // Calculate totals
    const total_item = details.reduce(
      (sum: number, detail: any) => sum + detail.amount,
      0
    );
    const total_price = details.reduce(
      (sum: number, detail: any) => sum + detail.amount * detail.price,
      0
    );

    // Create the order and its details in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create main order
      const orderMaterialUnit = await tx.orderMaterialUnit.create({
        data: {
          factory_id,
          amount: total_item,
          price: total_price,
          total_item,
          desc,
          status: OrderMaterialUnitStatus.Pending,
          DetailOrderMaterialUnit: {
            create: details.map((detail: any) => ({
              material_unit_id: parseInt(detail.material_unit_id),
              amount: detail.amount,
              price: detail.price,
              status: OrderMaterialUnitStatus.Pending,
            })),
          },
        },
        include: {
          DetailOrderMaterialUnit: true,
        },
      });

      return orderMaterialUnit;
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

// app/api/order-material/[id]/route.ts
