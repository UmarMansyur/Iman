/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/order-material/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { OrderMaterialUnitStatus } from "@prisma/client";

// GET - Fetch all orders
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "id";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const type_preorder = searchParams.get("type_preorder") || "false";
    const factoryId = parseInt(searchParams.get("factoryId") || "0");

    const where: any = {
      OR: [{ factory: { name: { contains: search } } }],
      factory_id: factoryId ? factoryId : undefined,
      type_preorder: type_preorder === "true" ? true : false,
    };


    const orderBy: any =
      sortBy === "user"
        ? { user_id: sortOrder }
        : sortBy === "tanggal"
        ? { created_at: sortOrder }
        : sortBy === "price"
        ? { price: sortOrder }
        : sortBy === "desc"
        ? { desc: sortOrder }
        : { created_at: "desc" };

    const orders = await prisma.orderMaterialUnit.findMany({
      where: {
        ...where,
      },
      include: {
        factory: true,
        user: true,
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
      orderBy: orderBy,
      skip: (page - 1) * limit,
      take: limit,
    });

    const totalOrder = await prisma.orderMaterialUnit.count({ where });

    return NextResponse.json({
      data: orders,
      pagination: {
        page,
        limit,
        total: totalOrder,
        totalPages: Math.ceil(totalOrder / limit),
      },
    });
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
    const { factory_id, desc, details, user_id, type_preorder = false } = body;
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
          factory_id: parseInt(factory_id),
          amount: total_item,
          price: total_price,
          total_item,
          desc,
          type_preorder: type_preorder,
          status: type_preorder
            ? OrderMaterialUnitStatus.Pending
            : OrderMaterialUnitStatus.Approved,
          user_id: parseInt(user_id),
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

// app/api/order-material/[id]/route.ts

// DELETE - Delete order

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id") || "";

  const response = await prisma.$transaction(async (tx) => {
    await tx.materialStock.deleteMany({
      where: {
        order_material_unit_id: parseInt(id as string),
      },
    });
    await tx.orderMaterialUnit.delete({
      where: {
        id: parseInt(id as string),
      },
    });
  });

  return NextResponse.json(
    { message: "Order berhasil dihapus", data: response },
    { status: 200 }
  );
}
