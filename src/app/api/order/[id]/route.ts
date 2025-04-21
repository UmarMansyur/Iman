/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { OrderMaterialUnitStatus, MaterialStockStatus } from "@prisma/client";

// PUT - Update order
export async function PUT(request: Request, { params }: any) {
  try {
    const paramsId = await params;
    const id = paramsId.id;
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

      // Jika status Approved, create material stock entries
      if (status === "Approved") {
        const detailsToCreate = details.map((detail: any) => ({
          factory_id: body.factory_id,
          material_unit_id: parseInt(detail.material_unit_id),
          amount: detail.amount,
          status: "In" as MaterialStockStatus,
        }));

        await tx.materialStock.createMany({
          data: detailsToCreate,
        });
      }

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

      const totalItem = await tx.detailOrderMaterialUnit.aggregate({
        where: { order_material_unit_id: parseInt(id) },
        _sum: { amount: true },
      });

      await tx.orderMaterialUnit.update({
        where: { id: parseInt(id) },
        data: {
          total_item: totalItem._sum.amount || 0,
        },
      });

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

export async function PATCH(request: Request, { params }: any) {
  const paramId = await params;
  const orderId = paramId.id;
  const body = await request.json();
  const { items, factory_id } = body;
  try {

    if(!items || items.length === 0) {
      throw new Error("Masukkan jumlah bahan baku yang diterima!");
    }

    const existingOrder = await prisma.orderMaterialUnit.findUnique({
      where: { id: parseInt(orderId) },
      include: {
        DetailOrderMaterialUnit: true,
      },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: "Order tidak ditemukan" },
        { status: 404 }
      );
    }


    // check dulu apakah ada jumlah diterima yang lebih besar dari jumlah order pada detail order
    for (const item of items) {
      const detailOrder = existingOrder.DetailOrderMaterialUnit.find(
        (detail) => detail.id === item.id
      );
      if (detailOrder && item.amount_received > Number(detailOrder.amount)) {
        throw new Error("Jumlah diterima tidak boleh lebih besar dari jumlah order");
      }
    }

    
    const response = await prisma.$transaction(async (tx) => {

      if(existingOrder.status !== OrderMaterialUnitStatus.Approved) {
        await tx.orderMaterialUnit.update({
          where: { id: parseInt(orderId) },
          data: { status: OrderMaterialUnitStatus.Approved },
        });
      }

      await tx.logOrderMaterialUnit.create({
        data: {
          factory_id: parseInt(factory_id),
          desc: `Konfirmasi penerimaan order dengan id ${orderId}`,
        },
      });

      const result = await Promise.all(
        items.map(async (item: any) => {
          const { id, amount_received } = item;

          const existingDetailOrder = await tx.detailOrderMaterialUnit.findFirst({
            where: {
              id: parseInt(id),
            },
          });

          if(!existingDetailOrder) {
            throw new Error("Detail order tidak ditemukan");
          }

          const detailOrder = await tx.detailOrderMaterialUnit.update({
            where: { id: parseInt(id) },
            data: { amount_received: Number(amount_received) },
          });

          const existingMaterialStock = await tx.materialStock.findFirst({
            where: {
              material_unit_id: existingDetailOrder.material_unit_id,
              factory_id: parseInt(factory_id),
              order_material_unit_id: parseInt(orderId),
            },
          });

          if(existingMaterialStock) {
            await tx.materialStock.update({
              where: { id: existingMaterialStock.id },
              data: { amount: Number(amount_received) },
            });
          } else {
            await tx.materialStock.create({
              data: {
                material_unit_id: existingDetailOrder.material_unit_id,
                amount: Number(amount_received),
                factory_id: parseInt(factory_id),
                order_material_unit_id: parseInt(orderId),
                status: "In" as MaterialStockStatus,
              },
            });
          }
          // jika ada pada hari yang sama maka update, jika tidak maka create
          const log = await tx.logOrderDetailMaterialUnit.findFirst({
            where: {
              detail_order_material_unit_id: detailOrder.id,
              created_at: {
                gte: new Date(new Date().setHours(0, 0, 0, 0)),
                lt: new Date(new Date().setHours(23, 59, 59, 999)),
              },
            },
          });

          if (log) {
            await tx.logOrderDetailMaterialUnit.update({
              where: { id: log.id },
              data: { amount_received: Number(amount_received) },
            });
          } else {
            await tx.logOrderDetailMaterialUnit.create({
              data: {
                detail_order_material_unit_id: detailOrder.id,
                amount_received: Number(amount_received),
                materialUnitId: parseInt(id),
              },
            });
          }

          return { detailOrder, log };
        })
      );
      return result;
    });
    return NextResponse.json({ message: "Berhasil", data: response });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
