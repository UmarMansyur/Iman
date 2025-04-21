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

    const { name, user_id, desc, type_preorder, details: detail_order} = await req.json();

    const response = await prisma.$transaction(async (tx) => {

      const exist = await tx.orderBahanBakuDistributor.findUnique({
        where: {
          id: Number(id),
        },
      });

      if (!exist) {
        throw new Error("Order tidak ditemukan");
      }

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
          distributor_id: Number(user_id),
          desc,
          type_preorder: type_preorder,
          DetailOrderBahanBakuDistributor: {
            createMany: {
              data: detail_order.map((item: any) => ({
                material_distributor_id: Number(item.material_distributor_id),
                amount: Number(item.amount),
                amount_received: type_preorder == false ? Number(item.amount) : 0,
                price: Number(item.price),
                sub_total: Number(item.sub_total),
              })),
            },
          },
          total: detail_order.reduce((acc: number, item: any) => acc + Number(item.sub_total), 0),
        },
      });

      return order;
    });

    return NextResponse.json({
      message: "Update order bahan baku berhasil",
      data: response,
    });

  } catch (error: any) {
    return NextResponse.json({
      message: error.message,
      error: error,
    }, {
      status: 500,
    });
  }
}

export async function PATCH(req: Request, { params }: { params: any }) {
  try {
    const paramId = await params;
    const id = paramId.id;
    const { items } = await req.json();

    const response = await prisma.$transaction(async (tx) => {
      const exist = await tx.orderBahanBakuDistributor.findUnique({
        where: {
          id: Number(id),
        },
      });

      if (!exist) {
        throw new Error("Order tidak ditemukan");
      }

      await Promise.all(items.map(async (item: any) => {
        await tx.detailOrderBahanBakuDistributor.update({
          where: {
            id: Number(item.id),
          },
          data: {
            amount_received: Number(item.amount_received),
          },
        });
      }));
    });

    return NextResponse.json({
      message: "Update order bahan baku berhasil",
      data: response,
    }, {
      status: 200,
    });

  } catch (error: any) {
    return NextResponse.json({
      message: error.message,
      error: error,
    }, {
      status: 500,
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