/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/db";
import { NextResponse } from "next/server";
export async function GET(req: Request, { params }: { params: any }) {
  const paramId = await params;
  const id = paramId.id;
  try {
    const exist = await prisma.orderBahanBakuDistributor.findUnique({
      where: {
        id: Number(id)
      },
      include: {
        distributor: true,
        factoryDistributor: {
          include: {
            Factory: true,
          }
        },
        DetailOrderBahanBakuDistributor: {
          include: {
            material_distributor: {
              include: {
                unit: true,
              }
            },
          }
        },
      }
    });
  
    if (!exist) {
      throw new Error("Order tidak ditemukan");
    }

    return NextResponse.json({
      message: "Order ditemukan",
      data: exist,
    });
  } catch (error: any) {
    return NextResponse.json({
      message: error.message,
      error: error,
    });
  }
}

export async function PUT(req: Request, { params }: { params: any }) {
  try {
    const paramsId = await params;
    const id = paramsId.id;

    const { name, factory_distributor_id, user_id, desc, type_preorder, detail_order} = await req.json();

    const response = await prisma.$transaction(async (tx) => {
      await tx.detailOrderBahanBakuDistributor.deleteMany({
        where: {
          order_bahan_baku_distributor_id: Number(id),
        },
      });

      const order = await tx.orderBahanBakuDistributor.update({
        where: {
          id: Number(id),
        },
        data: {
          factory: name,
          factory_distributor_id: Number(factory_distributor_id),
          distributor_id: Number(user_id),
          desc,
          type_preorder: type_preorder ? true : false,
          total: detail_order.reduce((acc: number, item: any) => acc + Number(item.sub_total), 0),
        },
      });

      return order;
    });

    return NextResponse.json({
      message: "Order update berhasil",
      data: response,
    });

  } catch (error: any) {
    return NextResponse.json({
      message: error.message,
      error: error,
    });
  }
}

export async function DELETE(req: Request, { params }: { params: any }) {
  try {
    const paramId = await params;
    const id = paramId.id;

    const exist = await prisma.orderBahanBakuDistributor.findFirst({
      where: {
        id: Number(id)
      }
    });

    if (!exist) {
      throw new Error("Order tidak ditemukan");
    }

    const response = await prisma.orderBahanBakuDistributor.delete({
      where: {
        id: Number(id)
      }
    });

    return NextResponse.json({
      message: "Order berhasil dihapus",
      data: response,
    });

  } catch (error: any) {
    return NextResponse.json({
      message: error.message,
      error: error,
    });
  }
}